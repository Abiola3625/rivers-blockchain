# Networks and endpoints

## Testnet

The testnet currently runs four validators in a GitHub codespace. Its addresses change when the codespace changes; the current addresses are:

| Service | Address |
|---|---|
| Full node (gRPC and gRPC-Web) | `https://psychic-guide-xvpv4rvg4pjhw54-9000.app.github.dev` |
| Faucet | `https://psychic-guide-xvpv4rvg4pjhw54-9123.app.github.dev/v2/gas` |
| Indexer | `https://psychic-guide-xvpv4rvg4pjhw54-9200.app.github.dev` |

> **Important:** The codespace testnet is reachable only while the codespace is running. A testnet on dedicated servers is planned; this page will list its permanent addresses.

## Chain parameters

| Parameter | Value |
|---|---|
| Native coin | RVRB (`0x2::sui::SUI`), 9 decimals |
| Epoch length | 24 hours |
| Stake to join as validator | 10,000 RVRB |
| Faucet | 50 RVRB per request (5 coins of 10 RVRB) |
| Bridge chain id | 2 (Rivers), 11 (Ethereum Sepolia) |

## Package and object addresses

The addresses of the Rivers packages (DEX, lending, shielded payments, Connect, vesting) and their shared objects are created when the testnet is set up, and change after a reset. Always read them from the indexer:

```bash
curl https://psychic-guide-xvpv4rvg4pjhw54-9200.app.github.dev/config
```

See [Indexer API: /config](indexer-api.html#config) for the fields.

## Local network

```bash
git clone https://github.com/Abiola3625/rivers-blockchain
cd rivers-blockchain
cargo build --bin sui
./target/debug/sui start --force-regenesis --with-faucet --committee-size 4
```

The local node listens on `http://127.0.0.1:9000` and the faucet on `http://127.0.0.1:9123`. Every Rivers website accepts `?rpc=`, `&faucet=` and `&indexer=` in its address to point at a local network.
