# Validators and staking

Validators run the nodes that order and execute transactions. Stakers lock RVRB with a validator to give it voting power and share its rewards.

## Becoming a validator

No approval is needed. An operator who runs a node and has enough stake can join.

| Rule | Testnet value |
|---|---|
| Stake to join the committee | 10,000 RVRB |
| Stake below which a validator is removed after a grace period | 5,000 RVRB |
| Grace period | 7 epochs |
| Stake below which a validator is removed at once | 2,500 RVRB |
| Active committee size at launch | up to 150 validators |
| Epoch length | 24 hours |

The joining process has three steps: the operator registers the node as a **candidate** with its network keys and addresses, stake is added to the candidate (from the operator or from delegators), and the operator requests to join. The validator enters the committee at the next epoch change.

## Delegated staking

Any RVRB holder can stake with any validator, with any amount, without running a server. Staked RVRB stays the staker's property: it is represented by a staked object that the staker holds and can withdraw. Stake becomes active at the next epoch, and so does a withdrawal.

## Rewards

At the end of each epoch the protocol pays the epoch's stake reward from the reward fund (chapter 7) together with the computation fees collected during the epoch. Rewards are split among validators in proportion to their stake. Each validator keeps its **commission**, a percentage it sets, from its delegators' share; the rest increases the value of the delegators' stake.

## Responsibilities

A validator is expected to:

- keep its node online and up to date;
- sign checkpoints and take part in consensus;
- protect its keys: the protocol key, the network key, the worker key and the account key;
- run the bridge node once the bridge is live (chapter 11).

Rivers Validator, the operator website, shows a validator's signing record, voting power, rewards per epoch, delegators and commission, and walks an operator through joining.

## Reporting and removal

Validators can report other validators that misbehave or stay offline. Validators whose stake falls below the thresholds above are removed automatically.
