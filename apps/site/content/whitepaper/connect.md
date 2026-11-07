# Rivers Connect

Rivers Connect is a payment network for regulated institutions — banks, payment firms and fintechs — built as a Move package on the shared ledger.

## Membership

The Rivers foundation holds the network's **operator capability** and uses it to admit members. Each member record holds:

| Field | Meaning |
|---|---|
| Name, city, country | Who the institution is |
| Tier | A classification set at admission |
| Payment limit | Largest single payment, in base units; 0 means no limit |
| Active | Whether the institution may send and receive |
| Joined | Epoch timestamp of admission |
| Sent, received | Counts of payments |

The operator can change a member's limit, suspend or reactivate it, remove it, and pause all payments on the network. Every change emits an `InstitutionChanged` or `PausedChanged` event, so the record of admissions and changes is public.

## Payments

A member pays another member by calling `pay<T>` with a coin, the receiving institution's address, a reference of up to 35 characters and a purpose code of up to 4 characters. These lengths follow the ISO 20022 end-to-end identification and purpose code fields. The contract checks that:

1. the network is not paused;
2. the amount is above zero;
3. both institutions are members and active;
4. the amount is within the sender's limit.

It then moves the coin to the receiver and emits a `Payment` event with a running number, the sender, the receiver, the coin type, the amount, the reference and the purpose.

## Messages for existing systems

Rivers Connect turns each `Payment` event into an ISO 20022 **pacs.008** customer credit transfer message, so a member's core banking system can read Rivers payments in a format it already processes. Batches can be sent in one transaction: each line becomes one payment, and all lines settle together or none do.

## Settlement asset

On the testnet, institutions pay each other in the NGNs and USDs test stablecoins. On mainnet, the settlement asset must be a stablecoin issued by a licensed issuer with reserves, or another asset approved for the purpose.

## What Connect does not do

Connect settles in tokens on chain. Moving money to and from bank accounts is done by each member under its own licence and agreements; Rivers does not hold customer funds.
