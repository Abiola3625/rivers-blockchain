# Core concepts

## Accounts and addresses

An address is 32 bytes, written as `0x` followed by 64 hex characters. It is derived from a public key and a signature scheme flag. Rivers Wallet creates Ed25519 keys from twelve recovery words (BIP-39).

## Objects

Every asset is an object with an ID, a version and an owner. Owners are:

| Owner | Meaning |
|---|---|
| Address | Only that address can use the object in a transaction |
| Shared | Any transaction may use it; the object's own code decides what is allowed |
| Immutable | Anyone can read it; nobody can change it |
| Object | The object belongs to another object (dynamic fields) |

Coins are objects of type `Coin<T>`. An address can hold many coins of the same type; wallets merge and split them as needed.

## Transactions

A transaction is a list of commands that all succeed or all fail. Commands can split and merge coins, call Move functions, publish packages and transfer objects, and can use the results of earlier commands. See [Transactions](transactions.html).

## Gas and drops

Fees are paid in RVRB. The smallest unit is the **drop**: one RVRB is 1,000,000,000 drops. A transaction sets a gas budget; it pays for computation at the gas price and for the storage it creates. Most of the storage fee is returned when the data is deleted.

## Checkpoints

Executed transactions are grouped into checkpoints, certified by the validators. Rivers Scan shows checkpoints as blocks; indexers read them in order.

## Epochs

Each epoch lasts 24 hours. At the end of an epoch, rewards are paid, stake changes take effect and the next validator committee is formed.

## Events

Move functions emit events, such as `Swapped` or `Payment`. Events are part of a transaction's effects and are how apps and indexers learn what happened. See [Events](events.html).
