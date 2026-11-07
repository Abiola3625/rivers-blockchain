# Bridge

The bridge between Rivers and Ethereum is **in development**. This page describes how it will work and what is ready.

## How it works

- **Ethereum to Rivers.** Lock ETH in the bridge contract on Ethereum Sepolia with `bridgeETH`, naming a Rivers address. The validators' bridge nodes sign the deposit; once enough stake has signed, bridged ETH is minted to the Rivers address.
- **Rivers to Ethereum.** Send bridged ETH to the bridge on Rivers with `0xb::bridge::send_token`, naming an Ethereum address. After the committee signs, claim the ETH on Ethereum with `transferBridgedTokensWithSignatures`.

## Chain ids

| Chain | Bridge chain id |
|---|---|
| Rivers testnet | 2 |
| Ethereum Sepolia | 11 |

## For validators

Each validator registers a secp256k1 bridge key on Rivers with `0xb::bridge::committee_registration` and runs `rivers-bridge`, the bridge node, next to its validator. On the testnet the codespace setup does both for the four validators.

## Status

| Part | Status |
|---|---|
| Bridge node in the release build | Added |
| Bridge contracts | Compiled and tested on a local Ethereum chain |
| Committee registration on Rivers | Tested on a local network |
| Sepolia deployment | Next |
| Wallet Cross-chain page | After deployment |
