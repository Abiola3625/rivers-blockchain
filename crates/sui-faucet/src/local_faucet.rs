// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use std::fmt;
use std::sync::Arc;

use anyhow::bail;
use backoff::ExponentialBackoff;
use sui_rpc_api::client::ExecutedTransaction;
use sui_sdk::types::effects::TransactionEffectsAPI;
use tokio::sync::Mutex;
use tokio::time::Duration;
use tracing::info;

use crate::FaucetConfig;
use crate::FaucetError;

use crate::CoinInfo;
use shared_crypto::intent::Intent;
use sui_keys::keystore::AccountKeystore;
use sui_sdk::types::programmable_transaction_builder::ProgrammableTransactionBuilder;
use sui_sdk::types::{
    base_types::{ObjectID, SuiAddress},
    gas_coin::GasCoin,
    transaction::{Transaction, TransactionData},
};
use sui_sdk::wallet_context::WalletContext;

const GAS_BUDGET: u64 = 10_000_000;
const NUM_RETRIES: u8 = 2;
/// The faucet pays with up to this many of its coins at once, so they merge into one.
const MAX_GAS_COINS: usize = 100;

/// On a freshly created `--force-regenesis` network the genesis coin objects may not yet be
/// readable the instant the cluster reports started — especially on slow or contended storage —
/// so the gas-coin scan is retried with backoff for up to this long before failing.
const GAS_COIN_LOOKUP_INITIAL_INTERVAL: Duration = Duration::from_millis(200);
const GAS_COIN_LOOKUP_MAX_ELAPSED_TIME: Duration = Duration::from_secs(10);

pub struct LocalFaucet {
    wallet: WalletContext,
    active_address: SuiAddress,
    coin_id: Arc<Mutex<ObjectID>>,
    coin_amount: u64,
    num_coins: usize,
}

/// We do not just derive(Debug) because WalletContext and the WriteAheadLog do not implement Debug / are also hard
/// to implement Debug.
impl fmt::Debug for LocalFaucet {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.debug_struct("SimpleFaucet")
            .field("faucet_wallet", &self.active_address)
            .field("coin_amount", &self.coin_amount)
            .finish()
    }
}

impl LocalFaucet {
    pub async fn new(
        mut wallet: WalletContext,
        config: FaucetConfig,
    ) -> Result<Arc<Self>, FaucetError> {
        let (coins, active_address) = find_gas_coins_and_address(&mut wallet, &config).await?;
        info!("Starting faucet with address: {:?}", active_address);

        Ok(Arc::new(LocalFaucet {
            wallet,
            active_address,
            coin_id: Arc::new(Mutex::new(*coins[0].id())),
            coin_amount: config.amount,
            num_coins: config.num_coins,
        }))
    }

    /// Make transaction and execute it.
    pub async fn local_request_execute_tx(
        &self,
        recipient: SuiAddress,
    ) -> Result<Vec<CoinInfo>, FaucetError> {
        let gas_price = self
            .wallet
            .get_reference_gas_price()
            .await
            .map_err(|e| FaucetError::internal(format!("Failed to get gas price: {}", e)))?;

        let mut ptb = ProgrammableTransactionBuilder::new();
        let recipients = vec![recipient; self.num_coins];
        let amounts = vec![self.coin_amount; self.num_coins];
        ptb.pay_sui(recipients, amounts)
            .map_err(FaucetError::internal)?;

        let ptb = ptb.finish();

        let mut coin_id = self.coin_id.lock().await;
        // Rivers: pay with every coin the faucet holds, largest first. The coins merge into the first
        // one, so RVRB sent to the faucet address after startup is used as well, and the faucet does
        // not stop when the coin it found at startup runs low.
        let mut coins = self
            .wallet
            .gas_objects(self.active_address)
            .await
            .map_err(|e| FaucetError::internal(format!("Failed to list faucet coins: {}", e)))?;
        coins.sort_by(|a, b| b.0.cmp(&a.0));
        let available: u64 = coins.iter().take(MAX_GAS_COINS).map(|c| c.0).sum();
        let needed = self.coin_amount * self.num_coins as u64 + GAS_BUDGET;
        if available < needed {
            return Err(FaucetError::internal(format!(
                "The faucet holds {} drops and needs {} for one request",
                available, needed
            )));
        }
        let gas: Vec<_> = coins
            .iter()
            .take(MAX_GAS_COINS)
            .map(|(_, o)| o.compute_object_reference())
            .collect();
        *coin_id = gas[0].0;
        let tx_data = TransactionData::new_programmable(
            self.active_address,
            gas,
            ptb,
            GAS_BUDGET,
            gas_price,
        );

        let tx = self
            .execute_txn_with_retries(tx_data, *coin_id, NUM_RETRIES)
            .await
            .map_err(FaucetError::internal)?;

        if !tx.effects.status().is_ok() {
            return Err(FaucetError::internal(format!(
                "Faucet transaction failed: {:?}",
                tx.effects.status()
            )));
        }
        let coins: Vec<CoinInfo> = tx
            .effects
            .created()
            .into_iter()
            .map(|o| CoinInfo {
                amount: self.coin_amount,
                id: o.0.0,
                transfer_tx_digest: *tx.effects.transaction_digest(),
            })
            .collect();

        Ok(coins)
    }

    async fn execute_txn(
        &self,
        tx_data: &TransactionData,
        coin_id: ObjectID,
    ) -> Result<ExecutedTransaction, anyhow::Error> {
        let signature = self
            .wallet
            .config
            .keystore
            .sign_secure(&self.active_address, &tx_data, Intent::sui_transaction())
            .await
            .map_err(FaucetError::internal)?;
        let tx = Transaction::from_data(tx_data.clone(), vec![signature]);

        let client = self.wallet.grpc_client()?;

        client
            .execute_transaction_and_wait_for_checkpoint(&tx)
            .await
            .map_err(|e| {
                FaucetError::internal(format!(
                    "Failed to execute PaySui transaction for coin {:?}, with err {:?}",
                    coin_id, e
                ))
            })
            .map_err(Into::into)
    }

    async fn execute_txn_with_retries(
        &self,
        tx: TransactionData,
        coin_id: ObjectID,
        num_retries: u8,
    ) -> Result<ExecutedTransaction, anyhow::Error> {
        let mut retry_delay = Duration::from_millis(500);
        let mut i = 0;

        loop {
            if i == num_retries {
                bail!("Failed to execute transaction after {num_retries} retries",);
            }
            let res = self.execute_txn(&tx, coin_id).await;

            if res.is_ok() {
                return res;
            }
            i += 1;
            tokio::time::sleep(retry_delay).await;
            retry_delay *= 2;
        }
    }

    pub fn get_coin_amount(&self) -> u64 {
        self.coin_amount
    }
}

/// Finds gas coins with sufficient balance and returns the address to use as the active address
/// for the faucet. If the initial active address in the wallet does not have enough gas coins,
/// it will iterate through the addresses to find one with sufficient gas coins.
///
/// Retries the scan with exponential backoff so that a transient startup race — where genesis
/// coins are not yet readable — does not fail the faucet.
async fn find_gas_coins_and_address(
    wallet: &mut WalletContext,
    config: &FaucetConfig,
) -> Result<(Vec<GasCoin>, SuiAddress), FaucetError> {
    let active_address = wallet
        .active_address()
        .map_err(|e| FaucetError::Wallet(e.to_string()))?;
    let wallet = &*wallet;

    let backoff = ExponentialBackoff {
        initial_interval: GAS_COIN_LOOKUP_INITIAL_INTERVAL,
        current_interval: GAS_COIN_LOOKUP_INITIAL_INTERVAL,
        max_elapsed_time: Some(GAS_COIN_LOOKUP_MAX_ELAPSED_TIME),
        ..Default::default()
    };

    backoff::future::retry(backoff, || async move {
        let found = scan_for_gas_coins(wallet, active_address, config)
            .await
            .map_err(backoff::Error::transient)?;

        found.ok_or_else(|| {
            backoff::Error::transient(FaucetError::Wallet(
                "No address found with sufficient coins".to_string(),
            ))
        })
    })
    .await
}

/// Scans the wallet's addresses once for a gas coin with a balance of at least `config.amount`,
/// returning the matching coins and the address that holds them, or `Ok(None)` if no such coin is
/// currently visible.
async fn scan_for_gas_coins(
    wallet: &WalletContext,
    active_address: SuiAddress,
    config: &FaucetConfig,
) -> Result<Option<(Vec<GasCoin>, SuiAddress)>, FaucetError> {
    for address in std::iter::once(active_address).chain(wallet.get_addresses()) {
        let coins: Vec<_> = wallet
            .gas_objects(address)
            .await
            .map_err(|e| FaucetError::Wallet(e.to_string()))?
            .iter()
            .filter_map(|(balance, obj)| {
                if *balance >= config.amount {
                    GasCoin::try_from(obj).ok()
                } else {
                    None
                }
            })
            .collect();

        if !coins.is_empty() {
            return Ok(Some((coins, address)));
        }
    }

    Ok(None)
}

#[cfg(test)]
mod tests {

    use super::*;
    use test_cluster::TestClusterBuilder;

    #[tokio::test]
    async fn test_local_faucet_execute_txn() {
        // Setup test cluster
        let cluster = TestClusterBuilder::new().build().await;
        let client = cluster.grpc_client();

        let config = FaucetConfig::default();
        let local_faucet = LocalFaucet::new(cluster.wallet, config).await.unwrap();

        // Test execute_txn
        let recipient = SuiAddress::random_for_testing_only();
        let tx = local_faucet.local_request_execute_tx(recipient).await;

        assert!(tx.is_ok());

        let coins = client
            .get_owned_objects(recipient, None, None, None)
            .await
            .unwrap();

        assert_eq!(coins.items.len(), local_faucet.num_coins);

        let tx = local_faucet.local_request_execute_tx(recipient).await;
        assert!(tx.is_ok());
        let coins = client
            .get_owned_objects(recipient, None, None, None)
            .await
            .unwrap();

        assert_eq!(coins.items.len(), 2 * local_faucet.num_coins);
    }

    #[tokio::test]
    async fn test_find_gas_coins_and_address() {
        let mut cluster = TestClusterBuilder::new().build().await;
        let wallet = cluster.wallet_mut();
        let config = FaucetConfig::default();

        // Test find_gas_coins_and_address
        let result = find_gas_coins_and_address(wallet, &config).await;
        assert!(result.is_ok());

        let (coins, _) = result.unwrap();
        assert!(!coins.is_empty());
        assert!(coins.iter().map(|c| c.value()).sum::<u64>() >= config.amount);
    }
}
