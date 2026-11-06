# Rivers testnet in this codespace

The testnet started on its own when this codespace opened: 4 validators, the public RPC, the faucet,
the Rivers indexer and Rivers DEX.

1. Open the **Ports** tab at the bottom of the screen.
2. Check that ports **9000** (Rivers RPC), **9123** (Rivers faucet) and **9200** (Rivers indexer) show
   **Public**. If one shows Private, right-click it → **Port visibility → Public**.
3. Copy the address of port 9000. That is the testnet RPC address for Rivers Wallet and Rivers Scan.

The testnet runs while this codespace runs. When the codespace stops, open it again from
**Code → Codespaces** on the repository page; the chain continues from where it stopped.

## What runs here

| Service | Port | Log |
|---|---|---|
| 4 validators and the RPC | 9000 | `/workspaces/.rivers/node.log` |
| Faucet, 50 test RVRB per request | 9123 | same |
| Wallet activity between testnet wallets | — | `/workspaces/.rivers/activity.log` |
| Rivers indexer (accounts, history, holders, rewards, tokens, DEX) | 9200 | `/workspaces/.rivers/indexer.log` |
| Rivers DEX setup, runs once | — | `/workspaces/.rivers/dex.log` |

The first start of the DEX publishes `rivers-packages/dex`, registers the USDs and NGNs test
stablecoins and opens the RVRB/USDs, RVRB/NGNs and USDs/NGNs pools. The starting testnet prices are
set in `codespace.sh` (`RVRB_PRICE_USDS`, `USDS_PRICE_NGNS`). Testnet tokens and prices have no value.
