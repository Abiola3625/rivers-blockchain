# Rivers testnet in this codespace

The testnet started on its own when this codespace opened: 4 validators, the public RPC and the faucet.

1. Open the **Ports** tab at the bottom of the screen.
2. Check that ports **9000** (Rivers RPC) and **9123** (Rivers faucet) show **Public**. If one shows
   Private, right-click it → **Port visibility → Public**.
3. Copy the address of port 9000. That is the testnet RPC address for Rivers Wallet and Rivers Scan.

The testnet runs while this codespace runs. When the codespace stops, open it again from
**Code → Codespaces** on the repository page; the chain continues from where it stopped.
