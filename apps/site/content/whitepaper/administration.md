# Administration and upgrades

## Who holds what

On the testnet, the administrator capabilities and the package upgrade capabilities are held by the first foundation genesis wallet. The foundation uses them through an administration interface that is not public.

Every administrative action is an ordinary signed transaction. Anyone can see in Rivers Scan which address changed what, and when.

## Protocol upgrades

Rivers follows the Sui upgrade process. A new release of the node software can carry a new **protocol version**. Validators install the release; when validators holding enough stake support the new version, it takes effect at an epoch boundary. Changes that alter the format of on-chain data are introduced in two steps — first the new format is supported, later it is enabled — so that wallets, indexers and explorers can update in between.

## Package upgrades

Each Rivers Move package has an upgrade capability. An upgrade must keep the package's public interface compatible, so existing objects and integrations keep working. Packages can also be made immutable by destroying the capability, which Token Studio does for every token it creates.

## Recommendations before mainnet

- Hold every administrator and upgrade capability in a multi-signature wallet controlled by several people.
- Add a delay between announcing and applying changes to lending risk settings.
- Publish every administrative action in a public changelog in addition to the chain itself.
