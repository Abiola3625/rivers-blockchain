# Rivers Scan

Live explorer for the Rivers testnet: blocks, transactions (classic and live view), addresses,
validators, RVRB supply and halving, genesis wallets and the test faucet. It reads the chain over
gRPC-Web from the testnet RPC, so it runs as a static site.

- Live site: https://rivers-scan.netlify.app
- Change the RPC address on the **Network** page, or open the site with `?rpc=<address>&faucet=<address>`.

```bash
npm install
npm run build   # writes dist/, which Netlify publishes
```
