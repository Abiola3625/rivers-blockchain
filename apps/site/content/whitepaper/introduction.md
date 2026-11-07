# Introduction

Money in Nigeria moves through many separate systems. Banks, payment firms and fintechs each keep their own ledger, and the ledgers are reconciled after the fact. A payment between two institutions can touch several intermediaries before both sides agree on the result.

## The problem

**Fragmented ledgers.** Each institution holds its own view of the truth. Agreement comes from messages, files and reconciliation, which take time and fail in ways that are expensive to unwind.

**Limited access to modern financial tools.** Saving in more than one currency, earning a return, borrowing against what one owns, or sending money privately are hard to do from a phone, and often depend on several separate providers.

**Builders start from zero.** A developer who wants to build a payment product must first integrate with many partners, each with its own rules and interfaces.

## The Rivers approach

Rivers puts these activities on one public ledger with a few clear properties:

- **One source of truth.** Every participant reads the same ledger. A payment is final when the validator committee commits it; there is nothing to reconcile afterwards.
- **Self-custody.** Users hold their own keys. The wallet keeps them encrypted on the user's device, and no Rivers service can move a user's funds.
- **Programmable money.** Move smart contracts make assets into typed objects that cannot be copied or lost by mistake, which removes whole classes of bugs common on other chains.
- **Privacy when it matters.** Shielded payments hide the amount, the sender and the receiver, while the chain still proves that every payment is valid.
- **Built for institutions as well as people.** Rivers Connect lets regulated institutions pay each other on the shared ledger with the message formats their systems already use.

## Why a new Layer 1

Rivers could have been an application on an existing chain. It is its own chain for three reasons:

1. **Economics.** Rivers sets its own supply, fees and reward schedule, so the people who secure the network are rewarded in the network's own token.
2. **Governance and locality.** Validators, institutions and builders in Nigeria and beyond can take part directly in securing and governing the network.
3. **Native features.** Privacy, institutional payments and the financial primitives are designed together with the base layer instead of being bolted on.

## Reading this paper

Chapters 3 to 6 describe the chain itself. Chapter 7 covers the token. Chapters 8 to 11 describe the applications built on the chain. Chapters 12 to 15 cover security, administration, the roadmap and risks. Developers who want to build on Rivers will find the full interfaces in the [documentation](../docs/introduction.html).
