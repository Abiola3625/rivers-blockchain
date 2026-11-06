# Rivers Blockchain

Rivers is a fork of [Sui](https://github.com/MystenLabs/sui) (release `mainnet-v1.83.1`, Apache 2.0).
This file records every change Rivers makes on top of Sui, so that upstream fixes can be merged later.

## Phase 1 changes

| Area | File | Change |
|---|---|---|
| Native token | `crates/sui-framework/packages/sui-framework/sources/sui.move` | Symbol `RVRB`, name `Rivers`, maximum supply 21,000,000 |
| Native token (Rust) | `crates/sui-types/src/gas_coin.rs` | `TOTAL_SUPPLY_SUI = 21_000_000`, genesis and reward-fund constants |
| Staking rewards | `crates/sui-config/src/genesis.rs` | 3,016.644572101 RVRB per daily epoch, halving every 1,825 epochs (5 years) |
| Validator stake limits | `crates/sui-types/src/governance.rs` | Join 10,000 RVRB, low 5,000, very low 2,500 |
| Genesis plan | `crates/sui-types/src/gas_coin.rs` | `RIVERS_GENESIS_GROUPS`: the 10M genesis supply in named wallet groups (see below) |
| Local network | `crates/sui-swarm-config/src/*.rs` | Every genesis wallet gets its own key. Validator stakes (150,000 RVRB each) come from the validator bootstrap wallet; test gas coins (1,000 RVRB each) come from the community wallets |
| Compiled framework | `crates/sui-framework/packages_compiled/` | Regenerated with `UPDATE=1 cargo test -p sui-framework --test build-system-packages` |

The Move type is still `0x2::sui::SUI`. Renaming the type would touch thousands of files and break
compatibility with Sui tooling, so only the symbol, name and amounts change.

## Supply

- Maximum supply: 21,000,000 RVRB (9 decimals; 1 RVRB = 1,000,000,000 mist, shown as "drops" in Rivers apps).
- Genesis: 10,000,000 RVRB:

| Group | RVRB | Wallets |
|---|---|---|
| Ecosystem and grants | 4,000,000 | 4 × 1,000,000 |
| Foundation and developers | 2,000,000 | 5 × 400,000 |
| Community | 2,000,000 | 2 × 1,000,000 |
| Early backers | 1,000,000 | 1 |
| Validator bootstrap | 600,000 | 1 |
| DEX liquidity | 400,000 | 1 |
- Reward fund: 11,000,000 RVRB, paid to stakers at each epoch end.
- Era 1 pays 5,505,376 RVRB over 5 years. Each later era pays half of the one before. Ten eras pay the full fund by year 50.

## Run a local network

```bash
cargo build --bin sui
./target/debug/sui start --force-regenesis --with-faucet
```

In a second terminal:

```bash
./target/debug/sui client gas          # RVRB gas coins of the active account
./target/debug/sui client pay-sui --input-coins <COIN_ID> --recipients <ADDRESS> --amounts 1000000000 --gas-budget 10000000
```
