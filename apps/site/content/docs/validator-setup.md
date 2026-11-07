# Validator setup

## The easy way: Launch a validator

Rivers Validator has a **Launch a validator** page that needs no command line:

1. Name your validator.
2. Press **Create account**. Your browser makes the validator account; write its 12 words down.
3. Pick your provider (Oracle Cloud free tier, Google Cloud, AWS or any Ubuntu server), follow the four steps shown, and paste the setup with **Copy setup**. The page fills in your validator's name, the network addresses, the account key and, on the testnet, the faucet that pays the registration fee.
4. Press **I have created the server**. The page follows the validator on chain: server starting, account funded, candidate registered, active. When it shows *Candidate registered*, press **Stake to this validator**.

After joining, sign in to Rivers Validator with the validator's 12 words to set commission and the public profile.

## The manual way

The script `rivers-testnet/validator-setup.sh` turns a fresh Ubuntu server into a Rivers validator. It downloads the Rivers release, fetches the genesis file from the indexer, creates the keys, writes the node configuration and installs two services: the node and a join service.

## Steps

1. Rent a server that meets the [requirements](validator-requirements.html) and open the ports.
2. Open [`validator-setup.sh`](https://github.com/Abiola3625/rivers-blockchain/blob/main/rivers-testnet/validator-setup.sh) and set the three values at the top:

```bash
VALIDATOR_NAME="My Validator"
RIVERS_RPC="https://…-9000.app.github.dev"
RIVERS_INDEXER="https://…-9200.app.github.dev"
```

3. Paste the whole file into your provider's **user data** or **cloud-init** box and create the server.
4. After about 15 minutes, read `/var/lib/rivers/VALIDATOR.txt`. It holds the validator account address and its twelve recovery words. Store the words offline, then delete the file.
5. Send about 2 RVRB to the validator account for fees. The join service registers the validator as a **candidate**.
6. Stake 10,000 RVRB to the validator from Rivers Validator's **Join** page, from your own wallet or from delegators.
7. The join service requests to join the committee. The validator becomes active at the next epoch.

## Check the node

```bash
systemctl status rivers-node
journalctl -u rivers-node -f
journalctl -u rivers-join -f
```

> **Important:** The codespace testnet forwards only web traffic, so outside validators cannot join it yet. The same script works without changes once the testnet runs on public servers.
