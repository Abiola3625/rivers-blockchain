# Token Studio

Token Studio, in Rivers Scan and Rivers Wallet, launches a new coin without writing code.

## Create a token

1. Enter the name, symbol, decimals, description and starting supply.
2. Choose the supply rules: fixed, burn only, mintable, or mintable up to a cap.
3. Optionally allow pausing or freezing (a regulated token).
4. Optionally lock a **team share** in vesting: 12-month cliff, released over 36 months.
5. Optionally open a **starting pool** against USDs, which sets the first price.
6. Sign with your wallet.

## What happens on chain

Token Studio compiles a Move package from a template in your browser, with your token's name and settings, and publishes it. The package is then made immutable, and the coin is registered in the coin registry so wallets and explorers show its name and symbol. If you chose a mintable token, you hold its treasury capability and can mint and burn from the token's page in Rivers Scan.

## After launch

The token appears in Rivers Scan with its holders, transfers and supply, and can be swapped in Rivers Wallet once it has a pool.
