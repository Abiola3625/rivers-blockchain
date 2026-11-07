# Validator operations

## Rivers Validator

The Rivers Validator website shows, for the validator connected to your wallet:

- whether the validator is a candidate, active or pending removal;
- the share of recent checkpoints it signed;
- stake, voting power and rewards per epoch;
- delegators, from staking events;
- commission and profile.

## Change commission

Validator → **Operate** → commission. The new rate applies from the next epoch.

## Update the profile

Name, description, image and project address can be changed from the same page.

## Leave the committee

**Operate** → leave. The validator leaves at the end of the epoch; delegators can then withdraw their stake.

## Upgrades

When a new Rivers release is published, update the binary and restart the service. The protocol version changes at an epoch boundary once validators holding enough stake run the release.

## Bridge node

Once the bridge to Ethereum is live, each validator will also run the bridge node with its own bridge key. See [Bridge](bridge.html).
