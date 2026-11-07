# Reading data

There are two ways to read Rivers data: from a node over gRPC, and from the indexer over HTTP.

## From a node

```js
// Balance of one coin type
const { balance } = await client.getBalance({ owner, coinType: '0x2::sui::SUI' });

// An object and its fields as JSON
const { object } = await client.getObject({ objectId, include: { json: true } });

// A transaction by digest
const tx = await client.getTransaction({ digest, include: { effects: true, events: true } });
```

Use the node for data that must be current to the latest checkpoint, such as an object you are about to use in a transaction.

## From the indexer

The indexer serves summaries, histories, holders, tokens, pools and events that would take many node calls to assemble. It is the right source for lists, charts and search.

```js
const INDEXER = 'https://psychic-guide-xvpv4rvg4pjhw54-9200.app.github.dev';
const summary = await (await fetch(`${INDEXER}/summary`)).json();
const txs = await (await fetch(`${INDEXER}/account/${owner}/txs?limit=50`)).json();
```

All endpoints are listed in the [Indexer API reference](indexer-api.html).

## Following events

To react to activity, read events by module and name from the indexer:

```js
const payments = await (await fetch(`${INDEXER}/events?module=network&name=Payment&addr=${me}`)).json();
```
