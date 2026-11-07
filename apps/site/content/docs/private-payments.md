# Private payments

The **Private** page in Rivers Wallet sends RVRB and USDs without showing the amount or the receiver on the ledger.

## Your private address

Your private address starts with `rvz1`. Give it to people who want to pay you privately. It does not reveal your public address. It comes from your wallet key, so your twelve recovery words restore it and every note sent to it.

## Shield

Moves coins from your public balance into the shielded pool.

1. Choose **Shield**, the coin and the amount.
2. Confirm. Your device makes a zero-knowledge proof in about a second, then sends the transaction.

The amount you shield and your public address are visible.

## Send privately

1. Choose **Send privately**, the coin, the amount, and paste the receiver's `rvz1…` address.
2. Confirm.

The receiver's wallet finds the new note by decrypting it. Nobody else can see the amount or the receiver.

## Unshield

Takes coins out of the pool to any public address. Leave your own address to move them back to your wallet. The amount and the receiving address are visible; which notes paid for it is not.

## What others can see

| Action | Visible |
|---|---|
| Shield | Amount, your public address |
| Send privately | That your public address paid a fee for a private transaction |
| Unshield | Amount, receiving address |

## Notes

Your shielded balance is made of notes. A private transaction spends up to two notes at once. If your balance is spread across many small notes, send yourself your two largest notes first to combine them.

> **Important:** The testnet proving key comes from a one-party setup. Do not treat testnet privacy as protection for real value.
