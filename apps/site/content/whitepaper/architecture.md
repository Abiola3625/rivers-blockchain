# Architecture

Rivers is a fork of the Sui codebase. This chapter explains the parts a reader needs to understand the rest of the paper: objects, Move, transactions, execution, checkpoints, epochs and fees.

## Objects

Everything on Rivers is an **object**: a coin, a liquidity share, a vesting schedule, a lending market, an administrator capability. Each object has:

- a unique 32-byte **ID**;
- a **version** that increases every time the object changes;
- an **owner**, which is one of: a single address, another object, *shared* (any transaction may use it, subject to the object's own rules), or *immutable* (it can be read but never changed).

Because ownership is explicit, the system knows before execution which objects a transaction touches. Transactions that touch different objects do not conflict and can run in parallel.

## Move

Smart contracts on Rivers are written in **Move**. Move treats assets as *resources*: a value of type `Coin<RVRB>` cannot be copied, and it cannot be silently dropped. The compiler and the bytecode verifier enforce these rules, so a contract cannot create money from nothing or lose it by accident.

Move also makes permissions explicit. A function that should only be called by an administrator takes a reference to a capability object, for example `&LendAdminCap`. Only the holder of that object can call it. Rivers uses this pattern for every administrative action.

## Transactions

A Rivers transaction is a **programmable transaction block**: a list of up to hundreds of commands that run in order and either all succeed or all fail. One transaction can, for example, take coins from the faucet, swap them in a pool, supply the result to a lending market and send the share coins to another address. Each command can use the results of the commands before it.

Every transaction names a sender, a gas payment and a gas budget, and is signed by the sender's key (Ed25519, secp256k1, secp256r1 and multisignature schemes are supported by the codebase; the Rivers Wallet uses Ed25519).

## Execution and finality

1. The user's wallet sends the signed transaction to a full node, which forwards it to the validators.
2. The validators order transactions with **Mysticeti consensus** (chapter 5).
3. Once a transaction is committed by consensus, every honest validator executes it the same way and produces the same **effects**: which objects were created, changed or deleted, the events emitted, and the gas used.
4. The transaction is final. There are no forks to wait out.

## Checkpoints

Validators group executed transactions into **checkpoints**, which are certified by the committee and form the canonical history of the chain. Rivers Scan shows checkpoints as blocks. Full nodes and indexers follow the chain by reading checkpoints in order.

## Epochs

Time on Rivers is divided into **epochs** of 24 hours. At the end of each epoch:

- staking rewards are paid (chapter 7);
- stake that was added or withdrawn during the epoch takes effect;
- the validator committee for the next epoch is fixed;
- protocol upgrades that enough stake supports take effect.

## Fees and storage

Every transaction pays two kinds of fee in RVRB:

- a **computation fee**, the gas used multiplied by the gas price, which goes to validators and stakers;
- a **storage fee**, proportional to the bytes of objects the transaction creates or grows. Most of this fee is returned as a *storage rebate* when the data is later deleted.

Amounts are expressed in the smallest unit of RVRB. One RVRB is 1,000,000,000 of these units, which Rivers apps call **drops**. On the testnet the reference gas price is shown live in Rivers Scan.

## Access for apps

Nodes expose a gRPC interface. Browsers reach it through gRPC-Web, which is how every Rivers website talks to the chain. A Rivers **indexer** follows the chain checkpoint by checkpoint and stores accounts, balances, transactions, tokens, pools and events in a database, then serves them over a simple HTTP API ([reference](../docs/indexer-api.html)).
