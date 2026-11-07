# The RVRB token

RVRB is the native token of Rivers. It pays fees, secures the network through staking and is the base asset of the Rivers exchange and lending markets.

## Supply

| Property | Value |
|---|---|
| Maximum supply | 21,000,000 RVRB |
| Created at launch | 10,000,000 RVRB |
| Paid to stakers over 50 years | 11,000,000 RVRB |
| Decimals | 9 (one RVRB is 1,000,000,000 drops) |

The maximum supply is a constant in the chain's code. The 11,000,000 RVRB that are not in circulation at launch sit in a reward fund inside the system state, from which the protocol pays stakers.

## Allocation at launch

| Group | RVRB | Share | Wallets |
|---|---|---|---|
| Ecosystem and grants | 4,000,000 | 40% | 4 × 1,000,000 |
| Foundation and developers | 2,000,000 | 20% | 5 × 400,000 |
| Community | 2,000,000 | 20% | 2 × 1,000,000 |
| Early backers | 1,000,000 | 10% | 1 |
| Validator bootstrap | 600,000 | 6% | 1 |
| DEX liquidity | 400,000 | 4% | 1 |

For a public network, each genesis wallet is created by its owner on their own device. The network setup reads only public addresses, so the people who build the network never hold the owners' keys.

## Emission schedule

At the end of every epoch the protocol pays **3,016.644572101 RVRB** to stakers. Every **1,825 epochs** (five years) the payment halves. Ten such eras pay the whole reward fund by year fifty.

| Era | Years | RVRB per epoch | RVRB in the era | Supply at the end |
|---|---|---|---|---|
| 1 | 0–5 | 3,016.64 | 5,505,376 | 15,505,376 |
| 2 | 5–10 | 1,508.32 | 2,752,688 | 18,258,064 |
| 3 | 10–15 | 754.16 | 1,376,344 | 19,634,408 |
| 4 | 15–20 | 377.08 | 688,172 | 20,322,580 |
| 5 | 20–25 | 188.54 | 344,086 | 20,666,666 |
| 6 | 25–30 | 94.27 | 172,043 | 20,838,709 |
| 7 | 30–35 | 47.14 | 86,022 | 20,924,730 |
| 8 | 35–40 | 23.57 | 43,011 | 20,967,741 |
| 9 | 40–45 | 11.78 | 21,505 | 20,989,247 |
| 10 | 45–50 | 5.89 | 10,753 | about 21,000,000 |

The schedule rewards early stakers most, when the network needs security most, and slows new supply as the network grows.

## Fees

Computation fees go to validators and stakers as part of each epoch's rewards. Storage fees fund the storage of objects and are mostly returned when the objects are deleted.

## Vesting

Allocations for investors and team members can be locked in an on-chain **vesting** schedule: an optional amount unlocks at the start, nothing more unlocks before a cliff, and the rest unlocks linearly until the end. The holder claims unlocked tokens from Rivers Wallet. A schedule marked revocable can be stopped by its issuer; tokens already unlocked stay with the holder and the locked remainder returns to the issuer. See the [vesting reference](../docs/ref-vesting.html).

## Stablecoins on the testnet

The testnet includes two test stablecoins, **USDs** (dollar) and **NGNs** (naira), each with 6 decimals and a faucet. They have no backing and no value. A naira or dollar stablecoin on mainnet requires a licensed issuer that holds reserves.
