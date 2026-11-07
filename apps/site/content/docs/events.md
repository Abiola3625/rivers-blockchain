# Events

Move functions emit events as part of a transaction's effects. Event types have the form `<package>::<module>::<Name>`.

| Module | Events | Reference |
|---|---|---|
| `pool` | `PoolCreated`, `Swapped`, `LiquidityChanged` | [DEX](ref-dex.html#events) |
| `lend` | `MarketCreated`, `Supplied`, `Withdrawn`, `CollateralChanged`, `Borrowed`, `Repaid`, `Liquidated` | [Lend](ref-lend.html#events) |
| `shield` | `NewCommitment`, `NewNullifier`, `Transacted` | [Shield](ref-shield.html#events) |
| `network` | `Payment`, `InstitutionChanged`, `PausedChanged` | [Connect](ref-connect.html#events) |
| `vesting` | `VestingCreated`, `VestingClaimed`, `VestingRevoked`, `BeneficiaryChanged` | [Vesting](ref-vesting.html#events) |
| `0x3::validator` | staking and validator events of the system package | Sui framework |

## Reading events

From a transaction:

```js
const r = await client.getTransaction({ digest, include: { events: true } });
```

From the indexer, by module and name, newest first:

```bash
curl "$INDEXER/events?module=network&name=Payment&limit=50"
```

The indexer stores events of `network`, `vesting` and `validator`, and keeps the shielded pool events in dedicated tables served by `/shield/notes` and `/shield/nullifiers`. DEX events feed `/dex/pools` and `/dex/pool/{id}/swaps`.

## Field encoding

In JSON, `u64` and larger numbers are strings, addresses are `0x`-prefixed hex, and `vector<u8>` fields are base64.
