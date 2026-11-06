# Rivers Scan

The public explorer for the Rivers testnet, live at the Netlify site connected to this repository.

- `design/` is the agreed Rivers interface (the preview), unchanged.
- `src/scanlive.js` replaces the preview's simulation with real chain data read over gRPC-Web, and
  marks sections whose contracts are not on the chain yet as "Coming in Phase 2".
- `src/scanshell.js` is the preview shell limited to Rivers Scan.

Change the RPC address on any page with `?rpc=<address>&faucet=<address>`.

```bash
npm install
npm run build   # writes dist/
```
