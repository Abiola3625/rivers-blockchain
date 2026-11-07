# Consensus and finality

Rivers uses **Mysticeti**, the consensus protocol of the Sui codebase. This chapter gives an overview; the protocol is specified in the Mysticeti research paper and implemented in the `consensus/` directory of the repository.

## Committee

In each epoch a fixed committee of validators runs consensus. Each validator's **voting power** follows its stake, with two rules that come from the system package:

| Rule | Value |
|---|---|
| Total voting power | 10,000 units |
| Quorum needed to commit | 6,667 units (just over two thirds) |
| Most voting power any one validator may hold | 1,000 units (10%) |

The cap on individual voting power means that no single validator, however much stake it attracts, can control the committee.

## How blocks become final

Mysticeti builds a directed acyclic graph of blocks. Every validator proposes blocks continuously, and each block references blocks from other validators in the previous round. Instead of waiting for a single leader, the protocol interprets the graph to decide which blocks are committed, and in which order.

Because all validators propose in parallel and commits follow directly from the graph, a transaction is final after one commit. There is no probabilistic finality: once committed, a transaction cannot be reverted by a longer chain, because there is no longer chain.

## Safety and liveness

The protocol is Byzantine fault tolerant. It stays safe — no two honest validators ever commit conflicting histories — as long as validators holding more than two thirds of the voting power are honest. It keeps making progress as long as validators holding at least two thirds of the voting power are online and can reach each other.

## Committee size

Every validator exchanges blocks with every other validator, so the work of consensus grows with the size of the committee. The Sui system package limits the active committee to 150 validators, and Rivers starts with this limit. The limit is a parameter that a protocol upgrade can raise as hardware and networks improve. Participation in securing the network is not limited to the committee: any RVRB holder can stake through a validator of their choice (chapter 6).

## Epoch changes

At the end of each epoch, validators agree on the final checkpoint, pay rewards, apply stake changes and form the next committee. A new committee member starts validating at the beginning of the next epoch.
