# Rivers packages: internal security review

This is an internal review by the Rivers developers. It is not an external audit. An external
audit is planned before mainnet, and this document is meant to give the external auditors a
starting point.

Scope, at the commit that adds this file:

| Package | Files | Tests |
|---|---|---|
| Rivers Lend | `dex/sources/lend.move` | `dex/tests/lend_tests.move` (10) |
| DEX price accumulators | `dex/sources/pool.move` (`accrue`, `cumulative_prices`) | `dex/tests/pool_tests.move` (5) |
| Rivers Shield | `shield/sources/shield.move`, `shield/circuits/transaction.circom`, `shield/js/shield.mjs` | `shield/tests/shield_tests.move` (9, with real Groth16 proofs) |
| Wallet shielded worker | `apps/wallet/src/shield-worker.js`, Private page in `apps/wallet/src/live-wallet.js` | Browser test on a local network |

## Method

Each package went through three passes.

1. **Specification pass.** Each public function was compared with the behaviour described in its
   module comment, the whitepaper and the wallet. Every arithmetic step was checked for rounding
   direction, overflow and division by zero.
2. **Adversarial pass.** For each function, the question was what a caller with a different goal
   can do: a borrower, a liquidator, a supplier, a pool trader, a relayer, the administrator, the
   indexer and a party that watches pending transactions.
3. **Test pass.** Each property that an attacker would want to break has a test that tries to
   break it. For Rivers Shield the tests use real proofs made with the testnet proving key, so the
   circuit, the JavaScript encoding and the Move verifier are tested together.

Severity: **Critical** (funds can be stolen), **High** (funds can be lost or frozen under realistic
conditions), **Medium** (loss or privacy leak under specific conditions, or a trust assumption that
must change before mainnet), **Low** (small loss or inconvenience), **Info** (no direct risk).

## Summary

| ID | Severity | Package | Finding | Status |
|---|---|---|---|---|
| S-1 | Critical before mainnet | Shield | Testnet proving key comes from a one-party setup | Accepted for testnet; public ceremony required |
| S-2 | Medium | Shield | The public address that pays the fee is linked to the private transaction | Documented in the wallet; relayer or sponsored fees recommended |
| S-3 | Medium | Shield | Proofs were not bound to one pool | **Fixed**: pool id in the external data hash; test added |
| S-4 | Low | Shield | Indexer can withhold notes | Accepted: wallet fails safely |
| S-5 | Low | Shield | Root history of 100 insertions | Accepted |
| S-6 | Info | Shield | GPL-3.0 code in the proving path | Legal review needed before mainnet |
| L-1 | Medium | Lend | No borrow or supply caps | Recommended before mainnet |
| L-2 | Medium | Lend | Price can be moved for longer than the average window in a thin pool | Mitigated by TWAP; caps and depth checks recommended |
| L-3 | Medium | Lend | Bad debt is not written off | Recommended before mainnet |
| L-4 | Medium | Lend | Administrator can change risk settings at once | Bounded on chain; timelock and multisig recommended |
| L-5 | Low | Lend | Share price after a full exit | Accepted |
| L-6 | Info | Lend | Interest compounds at each accrual | Accepted |
| D-1 | Info | DEX | Accumulator stops when a reserve is zero | Accepted |

No finding allows theft of funds on the testnet as deployed, apart from S-1, which applies to
anyone who could have kept the one-party setup's secret.

## Rivers Shield

### What was checked

- **Circuit.** `Transaction(20, 2, 2)` follows the Tornado Cash Nova design. Each input note's
  nullifier includes its tree position, which closes the known issue where one note could produce
  two nullifiers at different positions. Input and output amounts are range checked to 248 bits,
  so `sum(in) + publicAmount = sum(out)` cannot wrap around the field. The two nullifiers must
  differ. A zero-amount input does not need to be in the tree, which allows padding; a padding
  note has no value, so skipping the root check gives nothing to an attacker. `extDataHash` is
  constrained so that the compiler keeps it in the proof.
- **Public inputs.** The contract computes `publicAmount` and `extDataHash` itself, so a sender
  cannot choose them. The contract rejects any public input at or above the field size, so the same
  value cannot be presented in two forms.
- **Double spending.** Nullifiers are stored in a table and checked before verification; the test
  `note_cannot_be_spent_twice` replays a real private send.
- **Changing a proof's destination.** The recipient, both amounts and both encrypted notes are
  inside `extDataHash`. The test `recipient_cannot_be_changed` submits a real withdrawal proof with
  another recipient and is refused.
- **Old or invented roots.** Only the last 100 roots are accepted; root 0 is never accepted. The
  test `root_must_be_known` uses a proof made against a tree the pool has not reached.
- **Withdrawals cannot be frozen.** Pausing stops deposits and private sends, not withdrawals
  (`withdrawal_works_while_paused`). The administrator capability cannot move coins out of a pool.
- **Tree.** The incremental Merkle tree in Move and the tree in `shield.mjs` produce the same roots;
  the tests compare the root after each step with the root computed in JavaScript.
- **Encoding.** Verifying key and proof conversion to the arkworks compressed form were checked by
  verifying real proofs on chain, in unit tests and on a local network.
- **Wallet worker.** Keys are derived from the wallet key with domain separation, kept in a web
  worker and dropped when the wallet locks. A note is accepted only if its decrypted contents
  hash to the commitment on chain, so a wrong or malicious indexer cannot make the wallet believe
  in notes it does not own.

### S-1 Critical before mainnet: one-party trusted setup

The Groth16 proving key for the testnet was made by one party. Whoever knows that setup's secret
values can create proofs for false statements and empty the shielded pools. Before mainnet, run a
phase-2 ceremony with many independent contributors on top of a public phase-1 (for example the
Perpetual Powers of Tau), publish every contribution and its hash, and generate the verifying key
from the final result. Pools created with the testnet key must not be used on mainnet.

### S-2 Medium: fee payer is visible

A private send or unshield is a normal transaction whose sender pays the fee. Observers learn that
this public address used the shielded pool at that moment, although not the amount, the receiver or
the notes. The wallet says this on the Private page. Before mainnet, add a relayer or sponsored
transactions so that private sends can be submitted from an unrelated address, and bind the relayer
fee in `extDataHash`.

### S-3 Medium, fixed: proofs were not bound to one pool

`extDataHash` did not include the pool. Two pools share the same verifying key, and every pool
accepts the empty-tree root, so a deposit proof made for one pool was also valid in another. The
replaying party would have to pay the deposit, so the impact was limited, but a proof should only
ever be valid where it was made. The pool id is now the first field of `extDataHash` in Move and in
JavaScript. Test: `proof_for_one_pool_fails_in_another`.

### S-4 Low: indexer can withhold notes

The wallet rebuilds the tree from the indexer. An indexer that leaves out notes makes the wallet's
root wrong; the chain then refuses the proof, and no funds move. The wallet stops with an error if
note indexes have gaps. Running a second indexer, or reading `NewCommitment` events from a node
directly, removes the dependency.

### S-5 Low: root history

A proof stays valid for the next 99 insertions into its pool. Under heavy use a slow proof can
expire; the wallet then shows an error and the user tries again.

### S-6 Info: licences

`circomlib`, `snarkjs` and `circomlibjs` are GPL-3.0. The circuit includes circomlib templates, and
the wallet serves `snarkjs.min.js` as a separate file with its licence. `poseidon-lite` (MIT) and
`tweetnacl` (public domain) are used in the wallet bundle. Ask a lawyer whether distributing these
files is compatible with the Rivers licence before mainnet, or replace them with permissively
licensed equivalents.

## Rivers Lend

### What was checked

- **Price manipulation in one transaction.** Prices come from pool accumulators read at
  observations at least one minute apart; borrowing uses an average over at least 10 minutes. A
  swap and a borrow in the same transaction see the old average (test
  `price_pushed_in_one_transaction_does_not_count`).
- **Stale prices.** If the newest usable observation is older than one hour, borrowing,
  withdrawing collateral and liquidation stop (`stale_price_blocks_borrowing`).
- **Rounding.** New debt rounds up, repayment rounds the debt up, shares minted and coins
  withdrawn round down, and liquidation removes slightly less debt than repaid. Every rounding
  favours the market.
- **Liquidity.** Suppliers and borrowers cannot take the protocol reserves or coins that are lent
  out (`suppliers_cannot_take_lent_coins`).
- **Healthy positions** cannot be liquidated (`healthy_position_cannot_be_liquidated`); unhealthy
  ones lose at most half their debt per call, and the liquidator receives collateral worth the
  repaid amount plus the bonus, capped at the collateral held (`liquidation_after_price_falls`).
- **Parameter bounds.** `check_params` keeps the borrowing limit below the liquidation threshold,
  the threshold at or below 95%, and `threshold × (1 + bonus) < 1`, so each liquidation improves
  the position's health.
- **Pausing** stops new borrowing and collateral withdrawal against debt; repaying, supplying,
  withdrawing supply and liquidation keep working (`pause_stops_new_borrowing`).
- **Pool binding.** Every price read checks that the pool is the market's own pool.

### L-1 Medium: no caps

A market accepts any amount of supply and lends any amount up to its cash. On mainnet, a large
loan against a thinly traded collateral can exceed what liquidators can sell. Add per-market caps
on total borrowing and total collateral, set by Rivers Core within fixed bounds.

### L-2 Medium: sustained manipulation of a thin pool

An attacker who keeps a pool price high for longer than the 10-minute window can borrow too much.
This costs the attacker the arbitrage losses for the whole period, which is small when the pool is
small. Before mainnet, only create markets on pools with enough liquidity, add caps (L-1), and
consider a second price source.

### L-3 Medium: bad debt stays on the books

If collateral falls below the debt before liquidation, the remaining debt has nothing behind it but
still counts in `supplied_value`. The suppliers who withdraw first are paid in full and the last
ones bear the loss. Add a function that writes off debt from a position with no collateral and
spreads the loss across all shares.

### L-4 Medium: administrator changes take effect at once

The holder of `LendAdminCap` can lower the liquidation threshold within the bounds, which can make
existing positions liquidatable without warning. Before mainnet, hold the capability in a
multi-signature wallet and add a delay between announcing and applying risk changes.

### L-5 Low: share price after a full exit

When every supplier has left except for rounding dust, the next supplier receives shares one to one
and shares the market with the dust holders. The amounts involved are a few base units.

### L-6 Info: interest compounding

Interest is simple interest between accruals, and accruals happen at every market action, so the
effective rate is slightly higher when the market is busy. The difference is small at the rates
allowed.

## DEX price accumulators

### D-1 Info

`cumulative_prices` adds nothing while a reserve is zero. A pool cannot reach zero reserves through
swaps, so this only applies to an empty pool, which no market uses.

## Re-running the checks

```bash
cd rivers-packages/dex && rivers move test -e testnet      # 15 tests
cd rivers-packages/shield && rivers move test -e testnet   # 9 tests
```

To regenerate the shielded test proofs after changing the circuit or the encoding, compile the
circuit with circom 2.1, make a new proving key, and run the vector generator described in
`shield/README.md`.
