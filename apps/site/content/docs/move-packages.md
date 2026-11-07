# Move packages

Rivers adds five Move packages to the Sui framework. Their sources are in `rivers-packages/` in the repository.

| Package | Modules | Purpose | Reference |
|---|---|---|---|
| `rivers_dex` | `pool` | Constant-product pools, LP coins, time-weighted price totals | [DEX](ref-dex.html) |
| `rivers_dex` | `lend` | Isolated lending markets | [Lend](ref-lend.html) |
| `rivers_dex` | `usds`, `ngns`, `test_faucet` | Test stablecoins and their faucets | [Stablecoins](ref-stablecoins.html) |
| `rivers_shield` | `shield` | Shielded pools with Groth16 proofs | [Shield](ref-shield.html) |
| `rivers_connect` | `network` | Institutional payment network | [Connect](ref-connect.html) |
| `rivers_vesting` | `vesting` | Token vesting schedules | [Vesting](ref-vesting.html) |

The Sui framework packages keep their addresses: `0x1` (Move standard library), `0x2` (Sui framework), `0x3` (system), `0xb` (bridge). Well-known shared objects include the clock `0x6`, the system state `0x5`, the coin registry `0xc` and the bridge `0x9`.

## Addresses

Package and shared object addresses come from the indexer's [/config](indexer-api.html#config). Do not hard-code them: they change when the testnet is reset.

## Building and testing

```bash
cd rivers-packages/dex
rivers move build -e testnet
rivers move test -e testnet
```

`rivers` is the Rivers command-line tool, published with each release.

## Calling from TypeScript

```js
tx.moveCall({
  target: `${pkg}::module::function`,
  typeArguments: ['0x2::sui::SUI'],
  arguments: [tx.object(objectId), tx.pure.u64(amount), tx.object('0x6')],
});
```
