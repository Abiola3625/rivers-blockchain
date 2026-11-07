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
| Public genesis wallets | `crates/sui-swarm-config/src/network_config_builder.rs` | `RIVERS_GENESIS_ADDRESSES=<file>` reads the 14 genesis wallet addresses from a file, so the owners keep their private keys on their own devices |
| Local faucet | `crates/sui/src/sui_commands.rs` | Sends 5 coins of 10 RVRB per request, so one 1,000 RVRB gas coin can serve many requests |
| Investor vesting | `rivers-packages/vesting` | Move package `rivers_vesting::vesting`: lock RVRB or any token for an investor, with an unlock at start, a cliff and linear unlocking; claim, revoke, batch issue and change of wallet |
| Public testnet | `rivers-testnet/`, `.github/workflows/rivers-build.yml` | GitHub Actions builds Linux binaries; `setup.sh` turns a fresh Ubuntu server into a 4-validator testnet with daily epochs, public RPC and faucet. Upstream Sui workflows moved to `.github/sui-workflows-disabled/` |
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

## Genesis wallet addresses for a public network

Create each wallet on the owner's own device (or as a multisig address), then write only the
addresses into a file. Never put private keys on a server.

```text
# rivers-genesis-addresses.txt
foundation-1=0x...
foundation-2=0x...
foundation-3=0x...
foundation-4=0x...
foundation-5=0x...
ecosystem-1=0x...
ecosystem-2=0x...
ecosystem-3=0x...
ecosystem-4=0x...
community-1=0x...
community-2=0x...
early-backers-1=0x...
validator-bootstrap-1=0x...
dex-liquidity-1=0x...
```

```bash
RIVERS_GENESIS_ADDRESSES=rivers-genesis-addresses.txt ./target/debug/sui genesis --committee-size 4 --with-faucet
```

## Run a local network

```bash
cargo build --bin sui
./target/debug/sui start --force-regenesis --with-faucet --committee-size 4
```

In a second terminal:

```bash
./target/debug/sui client switch --env local
./target/debug/sui client faucet --url http://127.0.0.1:9123/v2/gas
./target/debug/sui client gas          # RVRB gas coins of the active account
./target/debug/sui client pay-sui --input-coins <COIN_ID> --recipients <ADDRESS> --amounts 1000000000 --gas-budget 10000000
```

## Phase 1 test results (local network, 4 validators)

| Check | Result |
|---|---|
| Coin metadata | Symbol RVRB, name Rivers, 9 decimals |
| Total supply | 21,000,000 RVRB, supply state FIXED |
| Genesis wallets | Foundation 5 × 400,000; Ecosystem 4 × 1,000,000; Community 2 × 983,000 (the remaining 34,000 funds local test gas); Early backers 1,000,000; DEX liquidity 400,000; Validator bootstrap 600,000 staked across 4 validators |
| Reward fund | 11,000,000 RVRB at genesis; 3,016.644572101 RVRB paid to stakers at each epoch end |
| Halving settings | Period 1,825 epochs, decrease rate 5,000 basis points (50%) |
| Validator limits | Join 10,000 RVRB, low 5,000, very low 2,500 |
| Owner-held keys | Genesis from an address file works; the owner of foundation-1 signed a 1,000 RVRB transfer with a key that never touched the network setup |
| Transfers | Wallet-to-wallet RVRB transfers succeed; a simple transfer costs about 0.002 RVRB |
| Faucet | Each request sends 50 RVRB (5 coins of 10 RVRB) |

## Investor vesting

`rivers-packages/vesting/sources/vesting.move` locks coins in a shared `Vesting` object per investor.

| Function | Who calls it | What it does |
|---|---|---|
| `issue` | Fund wallet owner | Creates one schedule and gives the caller an `IssuerCap` |
| `issue_many` | Fund wallet owner | Creates one schedule per investor with the same terms, in one transaction |
| `claim_to_sender` | Investor | Sends every unlocked token to the investor |
| `revoke_to_sender` | `IssuerCap` holder | Stops a revocable schedule; locked tokens return, unlocked tokens stay with the investor |
| `change_beneficiary` | Investor | Moves the schedule to a new wallet |

Unlocking: `immediate_bps` of the total unlocks at the start, nothing more unlocks before the cliff,
and the rest unlocks linearly from the start to `start + duration`.

```bash
cd rivers-packages/vesting
../../target/debug/sui move test -e testnet          # 8 unit tests
../../target/debug/sui client test-publish -e testnet --gas-budget 500000000
```

Local network test: the foundation-1 wallet issued 10,000 RVRB each to two investors (10% at start,
2-minute cliff, 10-minute duration). Investor A claimed 1,000 RVRB at once, was refused a second claim
before the cliff, then claimed 2,458.485 RVRB after it. Revoking investor B returned 6,505.11 RVRB and
kept 3,494.89 RVRB for investor B.

## Rivers Scan services (testnet)

| Part | Source | What it does |
|---|---|---|
| Rivers Wallet | `apps/scan/src/scanwallet.js` | Self-custody wallet inside Scan. 12 recovery words, encrypted in the browser with PBKDF2 and AES-GCM. Send, receive, stake, unstake, test RVRB, created tokens. |
| Rivers indexer | `rivers-testnet/indexer/indexer.mjs` | Reads every checkpoint into SQLite. Serves accounts, history, hourly and daily activity, holders, validator rewards per epoch, tokens and DEX pools on port 9200. |
| Token Studio | `rivers-packages/token-studio`, `apps/scan/src/scanstudio.js` | Creates a token from a compiled Move template in the browser: fixed, burn only, mintable or capped; optional pause and freeze; optional USDs pool. The package is made immutable and the currency is registered in the coin registry. |
| Rivers DEX | `rivers-packages/dex`, `rivers-testnet/indexer/dex-setup.mjs`, `apps/scan/src/scandex.js` | Constant-product pools with a 0.30% fee to liquidity providers, LP coins, USDs and NGNs test stablecoins with faucets. Scan has Swap and Pools pages and shows testnet prices, the liquidity map and token rankings. |

Move tests: `rivers move test -e testnet` in `rivers-packages/dex` and
`rivers-packages/vesting` (8 tests).

After changing `rivers-packages/token-studio`, rebuild it and regenerate
`apps/scan/src/studio-template.js`. After changing `rivers-packages/dex`, regenerate
`rivers-testnet/indexer/dex-bytecode.json` with `rivers move build -e testnet --dump-bytecode-as-base64`
and run `npm run build` in `rivers-testnet/indexer`. A testnet that already has the DEX keeps the
published version.


## Rivers interfaces and services (testnet)

| Part | Source | What it does |
|---|---|---|
| Interface framework | `apps/shared` | One shell, build and security headers for every interface. Each site serves one interface; `links.js` connects them. |
| Rivers Wallet | `apps/wallet` | Portfolio with prices, send, receive, swap, pools, staking, token creation, vesting claims, activity, security (show recovery words, change password, automatic lock). |
| Rivers Connect | `apps/connect`, `rivers-packages/connect` | Institutions admitted on chain pay each other with ISO 20022 reference and purpose, single payments or CSV batches, convert through Rivers DEX, see their controls. The pacs.008 message is generated for core banking systems. |
| Rivers Core | `apps/core` | Administrators: health and alerts, invariant checks, protocol and mining parameters, faucet top-up, institution admission, limits, suspension and payment pause, investor vesting, endpoint tests and an on-chain audit log. |
| Rivers Validator | `apps/validator`, `rivers-testnet/validator-setup.sh` | Validator dashboard, validator set, operator actions (commission, profile, leave), joining and a one-script server setup. |
| Faucet | `crates/sui-faucet/src/local_faucet.rs` | Pays from all of its coins, so it keeps working after its first coin runs low and uses RVRB sent to it later. |
| Release build | `.github/workflows/rivers-build.yml` | Publishes `rivers` (command line) and `rivers-node` (validator and full node). |

Move tests: `rivers move test -e testnet` in `rivers-packages/connect` (5 tests).

The service setup gives the Rivers Connect operator capability and every package upgrade capability
to the administrator address (`RIVERS_ADMIN`, by default the foundation-1 genesis wallet). Import
that wallet in Rivers Core with its recovery words to administer the network.

| Rivers Lend | `rivers-packages/dex/sources/lend.move`, wallet Lend page, Core markets page | Isolated markets (collateral and loan coin per market), share coins for suppliers, kinked interest rate, liquidation with bonus. Prices are pool time-weighted averages (at least 10 minutes, at most 1 hour old); a keeper records a price observation every 2 minutes. |
| Website | `apps/site` | Public site with the scroll-driven 3D story, links to every product, the whitepaper and the documentation. |
| Shielded payments (in progress) | `rivers-packages/shield` | Groth16 join-split circuit (2 notes in, 2 out, tree depth 20), Poseidon commitments, nullifiers, encrypted notes and the Move pool that verifies proofs with `sui::groth16`. |

Move tests: `rivers move test -e testnet` in `rivers-packages/dex` (15 tests: pools and lending).

Not built yet, and why:

| Feature | Reason |
|---|---|
| Cross-chain bridge | In progress next: Ethereum (Sepolia testnet first), built on the Sui native bridge in `bridge/`. Needs a funded Sepolia deployer account. |
| Shielded payments for mainnet | Need a public trusted setup ceremony with many contributors and an external audit. |
| NFT collections, transfer fees in Token Studio | Need their own token standards; transfer fees need closed-loop tokens. |
| Bank settlement to bank accounts | Needs agreements with banks; Connect settles in tokens on chain today. |
| Validator map and regions | Validators publish no location; needs validators on public servers. |
