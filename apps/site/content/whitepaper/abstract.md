# Abstract

Rivers is a proof-of-stake Layer 1 blockchain designed and built in Nigeria. It gives people, businesses and financial institutions one shared ledger for payments, savings, trading, lending and private transfers, settled in moments and verifiable by anyone.

Rivers is built on the Sui codebase. It keeps Sui's object-centric data model, the Move smart contract language and the Mysticeti consensus protocol, and changes the economics, the validator rules and the applications. The native token, **RVRB**, has a hard cap of 21,000,000 units: 10,000,000 exist at launch and 11,000,000 are paid to stakers over fifty years on a schedule that halves every five years.

On top of the base layer, Rivers ships a set of native applications, each published as its own website:

- **Rivers Wallet**, a self-custody wallet for holding, sending, swapping, staking, lending, borrowing and paying privately.
- **Rivers Scan**, a live explorer and a no-code token launcher.
- **Rivers Connect**, a payment network for banks and payment firms with ISO 20022 messages.
- **Rivers Validator**, the operator console for the people who secure the network.

Four on-chain packages power these products: a constant-product exchange with a manipulation-resistant price oracle, isolated lending markets, shielded payments built on Groth16 zero-knowledge proofs, and token vesting. A bridge to Ethereum, built on the native bridge design that the Sui codebase provides, is in development.

This paper describes the system: the problem it addresses, the architecture of the chain, consensus and finality, the validator and staking model, monetary policy, the financial and privacy primitives, the institutional payment network, the bridge, the security model, administration and the roadmap. It closes with the risks that every reader should weigh.

> Rivers runs as a public testnet. Figures marked as testnet values can change before mainnet, and test tokens have no value.
