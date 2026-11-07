# Lending and borrowing

Rivers Lend has isolated markets. Each market lends one coin against one collateral coin.

## Supply

1. Open **Lend** and pick a market.
2. Choose **Supply**, enter an amount of the coin the market lends, and confirm.
3. You receive share coins. They grow in value as borrowers pay interest.

Withdraw at any time, up to the coins that are not lent out.

## Borrow

1. Choose **Borrow** in a market.
2. Add collateral in the same step, or before.
3. Enter the amount to borrow. You can borrow up to the market's loan-to-value (60% by default) of your collateral's value.

## Health

The Lend page shows a **health** figure for each loan:

```text
health = collateral value × liquidation threshold / debt
```

Above 1 the loan is safe. Below 1, anyone can repay up to half your debt and take collateral worth that amount plus a 5% bonus. Repay or add collateral well before health reaches 1.

## Prices

Collateral is valued with the average price of the market's DEX pool over at least 10 minutes. This makes manipulation expensive, and it also means the price on the Lend page can lag the live pool price.

## When a market is paused

The administrator can pause new borrowing. Repaying, supplying, withdrawing and liquidation keep working.

## Common messages

| Message | What to do |
|---|---|
| That is above your borrowing limit | Borrow less or add collateral |
| The market price needs fresh observations | Wait about 10 minutes and try again |
| The market does not have that much available | Borrow less, or wait for repayments |
