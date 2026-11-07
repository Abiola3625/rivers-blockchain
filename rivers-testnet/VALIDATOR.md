# Running a Rivers validator

Rivers Validator (the `apps/validator` site) is the operator's interface: signing record, stake,
voting power, delegators, rewards per epoch, commission and profile changes, and the steps to join.

## Rules the chain enforces

| Rule | Value on the testnet |
|---|---|
| Stake to join | 10,000 RVRB |
| Removed at once below | 2,500 RVRB |
| Removed after 7 epochs below | 5,000 RVRB |
| Seats | 150 |
| Epoch | 24 hours |

No approval is needed. Anyone who runs a node and has the stake can join.

## Steps

1. Rent an Ubuntu 24.04 server with 4 cores, 16 GB memory, 500 GB SSD and a public IPv4 address.
   Open TCP 8080 and 8081, and UDP 8081, 8082 and 8084.
2. Open [`validator-setup.sh`](validator-setup.sh), set `VALIDATOR_NAME`, `RIVERS_RPC` and
   `RIVERS_INDEXER` at the top (Rivers Validator → Server setup shows the addresses), and paste the
   whole file into the provider's "user data" or "cloud-init" box.
3. After about 15 minutes, read `/var/lib/rivers/VALIDATOR.txt` on the server. It holds the
   validator account address and its 12 recovery words. Store the words offline and delete the file.
4. Send 2 RVRB to the account for fees. The server registers the validator as a candidate.
5. Stake 10,000 RVRB to the account in Rivers Validator → Join (your own wallet or delegators).
   The server then requests to join, and the validator starts at the next epoch.

The setup script was tested up to the on-chain steps (candidate, stake, join request) on a local
Rivers network.

## Current limit

The testnet in the GitHub codespace forwards web traffic only. Outside validators cannot reach its
four validators, so they cannot join it. Once the Rivers network runs on public servers (the
`setup.sh` server, or any VPS), the same script works without changes.
