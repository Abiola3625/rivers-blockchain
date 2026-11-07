# Indexer API

The Rivers indexer reads every checkpoint and serves JSON over HTTP GET. All responses are JSON; amounts that can exceed 2^53 are strings in base units. Errors return `{ "error": "…" }` with status 400, 404 or 500.

Base address on the testnet: `https://psychic-guide-xvpv4rvg4pjhw54-9200.app.github.dev`

## Chain

### /status

The indexer's progress.

```json
{ "checkpoint": 51865, "latest": 51865, "synced": true, "accounts": 91, "transactions": 841 }
```

### /summary

Activity over the last 24 hours.

| Field | Meaning |
|---|---|
| `accounts`, `holders` | Known accounts; accounts holding RVRB |
| `active24h`, `new24h` | Accounts active or first seen in 24 hours |
| `tx24h` | All transactions, including system transactions |
| `userTx24h` | Transactions sent by users |
| `fees24h`, `volume24h` | RVRB paid in fees; RVRB moved |
| `checkpoint`, `synced` | Progress |

### /stats/hourly, /stats/daily

Transactions and active accounts per hour or per day.

## Accounts

### /account/{address}

Balance, rank, amounts sent and received, transaction count, and first and last activity.

### /account/{address}/txs

The account's transactions, newest first. `?limit=` up to 500.

### /account/{address}/daily

The account's activity per day.

### /holders

RVRB holders by balance: `{ "total", "held", "rows": [ { "addr", "balance", "txCount", "firstTs", "lastTs" } ] }`.

### /account-tokens?addr={address}

Every token the account holds.

## Tokens

### /tokens

All tokens with type, name, symbol, decimals, description, supply and holder count.

### /token/{coinType}, /token/{coinType}/holders, /token/{coinType}/txs

One token, its holders and its transfers. URL-encode the coin type.

## Validators

### /validators/rewards

Rewards per validator per epoch, with stake and commission.

## DEX

### /dex/pools

Pools with types, reserves, 24-hour swaps and volume.

### /dex/pool/{id}/swaps

Recent swaps in one pool. `?limit=` up to 500.

## Events

### /events?module=&name=&addr=&limit=

Events of `network`, `vesting` or `validator`, newest first. `addr` keeps events sent by or mentioning the address.

## Shielded pools

### /shield/notes?pool=&from=&limit=

Notes of a pool in tree order from index `from`: `[{ "i": 0, "c": "<commitment>", "e": "<encrypted, base64>" }]`. Wallets rebuild the tree from these.

### /shield/nullifiers?pool=&since=

Spent-note markers of a pool.

### /shield/stats

Per pool: transactions, deposits, private sends, withdrawals, amounts in and out, notes and last activity.

## Configuration

### /config

Addresses created by the testnet setup.

| Field | Content |
|---|---|
| `dex.package`, `dex.registry` | DEX package and pool registry |
| `dex.coins` | `USDs` and `NGNs` coin types |
| `dex.faucets` | Stablecoin faucet objects |
| `dex.pools` | Pool ids by pair name |
| `dex.lend` | Lending markets by name, with collateral, debt and pool |
| `dex.shield` | Shield package and pools by coin |
| `dex.connect` | Connect package and network object |
| `dex.vesting` | Vesting package |
| `dex.admin` | Administrator address |

### /bridge

The bridge committee's public keys and Ethereum addresses, and the Sepolia contract addresses once deployed.

### /network/genesis.blob

The genesis file, for new validators.
