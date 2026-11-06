# Rivers Blockchain

Rivers is a layer 1 blockchain for payments, DeFi and institutions. Its native token is **RVRB**.

| | |
|---|---|
| Maximum supply | 21,000,000 RVRB |
| At genesis | 10,000,000 RVRB |
| Staking rewards | 11,000,000 RVRB over 50 years, halving every 5 years |
| Smart contracts | Move |
| Consensus | Proof of Confluence, built on Mysticeti |

## What is in this repository

- The Rivers node, validator and command-line tool (`crates/`, `consensus/`).
- The RVRB token and staking rules (`crates/sui-framework/packages/`).
- Investor vesting contract (`rivers-packages/vesting`).
- Testnet genesis wallet addresses (`rivers-testnet/`).

[RIVERS.md](RIVERS.md) lists every change Rivers makes, the supply plan, test results and how to run a local network.

## Run a local network

```bash
cargo build --bin sui
./target/debug/sui start --force-regenesis --with-faucet --committee-size 4
```

## Credits and licence

Rivers is built on [Sui](https://github.com/MystenLabs/sui) by Mysten Labs, release `mainnet-v1.83.1`,
used under the Apache 2.0 licence (see [LICENSE](LICENSE)). The original Sui readme is in [README-SUI.md](README-SUI.md).
