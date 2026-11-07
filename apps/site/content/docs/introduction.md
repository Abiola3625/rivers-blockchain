# Introduction

Welcome to the Rivers documentation. Rivers is a Layer 1 blockchain built in Nigeria for payments, savings and institutions. These pages explain how to use Rivers, how to run a validator and how to build on the chain.

## Where to start

| You want to | Start here |
|---|---|
| Understand the moving parts | [Core concepts](concepts.html) |
| Get test RVRB and make a first payment | [Quickstart](quickstart.html) |
| Use the wallet, stake, swap, lend or pay privately | [Rivers Wallet](wallet.html) |
| Run a validator | [Validator requirements](validator-requirements.html) |
| Build an app | [TypeScript SDK](sdk.html) |
| Call a Rivers contract | [Move packages](move-packages.html) |
| Read chain data over HTTP | [Indexer API](indexer-api.html) |
| Connect a bank or payment firm | [Connect integration](connect-integration.html) |

## The products

| Product | For | What it does |
|---|---|---|
| Rivers Wallet | Everyone | Self-custody wallet: send, swap, stake, lend, borrow, pay privately, claim vesting |
| Rivers Scan | Everyone | Live explorer and Token Studio |
| Rivers Connect | Banks and payment firms | Institutional payments with ISO 20022 references |
| Rivers Validator | Node operators | Join the committee, follow rewards, manage commission |

Each product is its own website. They all read the same chain and the same indexer.

## Compatibility with Sui

Rivers is built on the Sui codebase. The Sui TypeScript SDK, the Move language and most Sui tooling work with Rivers without changes. The native coin type is `0x2::sui::SUI`, which Rivers apps display as **RVRB**.

> Rivers runs as a public testnet. Test tokens have no value and the network may be reset.
