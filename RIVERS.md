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
| Foundation | `crates/sui-types/src/gas_coin.rs` | 2,000,000 RVRB to the foundation and developers at genesis, split across 5 wallets of 400,000 |
| Local network | `crates/sui-swarm-config/src/*.rs` | 1,000,000 RVRB stake per validator, 20,000 RVRB gas coins, 5 foundation wallets with their own keys, genesis reserve to the first account |
| Compiled framework | `crates/sui-framework/packages_compiled/` | Regenerated with `UPDATE=1 cargo test -p sui-framework --test build-system-packages` |

The Move type is still `0x2::sui::SUI`. Renaming the type would touch thousands of files and break
compatibility with Sui tooling, so only the symbol, name and amounts change.

## Supply

- Maximum supply: 21,000,000 RVRB (9 decimals; 1 RVRB = 1,000,000,000 mist, shown as "drops" in Rivers apps).
- Genesis: 10,000,000 RVRB, of which 2,000,000 go to the foundation and developers in 5 wallets of 400,000 RVRB.
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
