# Connect integration

This guide is for banks and payment firms that join Rivers Connect.

## 1. Admission

The Rivers foundation admits your institution with its name, city, country, tier and a payment limit. Your institution's wallet address becomes its identity on the network. Create that wallet on a device your institution controls, and protect its recovery words as you would any signing key.

## 2. Sign in

Open Rivers Connect and sign in with the institution's wallet. The member pages appear once the network recognizes the address.

## 3. Send a payment

Choose the receiving institution, the coin, the amount, a reference of up to 35 characters and a four-letter ISO 20022 purpose code, such as `SUPP` (supplier payment) or `SALA` (salary).

## 4. Batches

Paste one payment per line:

```text
0x<institution address>,250000,SAL-NOV-01,SALA
0x<institution address>,125000,INV-2231,SUPP
```

All lines settle in one transaction: either every payment succeeds or none does.

## 5. Read payments in your systems

Every payment emits a `Payment` event. Rivers Connect exports each one as an ISO 20022 **pacs.008** message. To read events directly:

```bash
curl "$INDEXER/events?module=network&name=Payment&addr=0x<your address>"
```

## 6. Call the contract directly

```js
tx.moveCall({
  target: `${CONNECT}::network::pay`,
  typeArguments: [NGNS],
  arguments: [tx.object(NETWORK), coinWithBalance({ type: NGNS, balance: 250_000_000_000n }), tx.pure.address(to), tx.pure.string('SAL-NOV-01'), tx.pure.string('SALA')],
});
```

`CONNECT`, `NETWORK` and `NGNS` come from [/config](indexer-api.html#config).

## Controls

The operator can set your payment limit, suspend and reactivate your institution, and pause all payments. Every change is an on-chain event.
