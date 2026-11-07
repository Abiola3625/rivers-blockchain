# Deploying the Rivers interfaces

Each Rivers interface is its own website, built from this repository by Netlify. All five read the
same testnet, indexer and contracts, and link to each other.

| Interface | Who it is for | Netlify base directory |
|---|---|---|
| Rivers Scan | Everyone: blocks, transactions, tokens, swap, pools, faucet | `apps/scan` (already live) |
| Rivers Wallet | Users: hold, send, swap, stake, pools, create tokens, vesting claims | `apps/wallet` |
| Rivers Connect | Banks and payment firms: ISO 20022 payments, batches, liquidity, compliance | `apps/connect` |
| Rivers Core | Rivers administrators: monitoring, parameters, banks, investors, audit log | `apps/core` |
| Rivers Validator | Validator operators: signing, stake, rewards, joining, server setup | `apps/validator` |

## Add one interface on Netlify (repeat for each)

1. Netlify → **Add new project → Import an existing project → GitHub →**
   `Abiola3625/rivers-blockchain`.
2. **Base directory**: the value from the table, for example `apps/wallet`.
3. Leave the build command and publish directory empty. The `netlify.toml` in the base directory
   sets them (`npm install && npm run build`, publish `dist`, Node 22).
4. **Deploy**. Rename the site under **Site configuration → Change site name**, for example
   `rivers-wallet`.

## Link the interfaces to each other

Send the five site addresses to the Rivers developer, or put them in `apps/shared/links.js`:

```js
const RV_LINKS={
 explorer:'https://….netlify.app',     // Rivers Scan
 wallet:'https://….netlify.app',       // Rivers Wallet
 institutions:'https://….netlify.app', // Rivers Connect
 console:'https://….netlify.app',      // Rivers Core
 validator:'https://….netlify.app',    // Rivers Validator
};
```

Every site rebuilds by itself after the change is pushed.

## Security

- Keys never leave the browser. A wallet is encrypted with the user's password (PBKDF2 with
  250,000 rounds and AES-GCM) and locks itself after 15 minutes without activity.
- Rivers Core and Rivers Connect show their tools only to wallets that hold the matching on-chain
  role, and the chain checks the role again on every action: the Rivers Connect operator capability
  for administrators, admission in the Rivers Connect registry for institutions.
- Every site sends a strict content security policy and cannot be embedded in another site.
