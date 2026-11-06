# Rivers public testnet

The first Rivers testnet runs 4 validators, a public RPC and a faucet on one free server.
Test RVRB has no value. The testnet will be reset before mainnet.

| Service | Address |
|---|---|
| RPC for wallets, Rivers Scan and developers | `http://<server-ip>:9000` |
| Faucet (50 test RVRB per request) | `http://<server-ip>:9123/v2/gas` |
| Epoch length | 24 hours |

## How the server is built

1. Every change to the node code triggers the **Build Rivers** workflow in GitHub Actions. It builds
   the `rivers` program for Linux (x86_64 and ARM) and publishes it as the latest GitHub release.
2. [`setup.sh`](setup.sh) runs once when a new Ubuntu server first starts. It downloads the latest
   build, creates the genesis from [`genesis-addresses.txt`](genesis-addresses.txt), installs a
   service that restarts on failure and opens ports 9000 and 9123.

Nobody types commands on the server. The script is pasted into the cloud provider's "cloud-init"
box while creating the server.

## Free server on Oracle Cloud

Oracle's Always Free plan includes an ARM server with 2 cores, 12 GB of memory and 200 GB of disk.
Oracle asks for a bank card to verify the account but does not charge for Always Free resources.

1. Create an account at oracle.com/cloud/free. Choose the home region carefully; it cannot change.
2. Open **Compute → Instances → Create instance**.
   - Image: **Canonical Ubuntu 24.04**.
   - Shape: **Ampere → VM.Standard.A1.Flex**, 2 OCPUs, 12 GB memory.
   - Networking: keep the default network and **assign a public IPv4 address**.
   - SSH keys: **save the private key** for emergencies.
   - Boot volume: 150 GB.
   - **Advanced options → Management → Paste cloud-init script**: paste the whole of `setup.sh`.
3. Click **Create**.
4. Open the instance's **subnet → Security list → Add ingress rules**: source `0.0.0.0/0`, protocol
   TCP, destination ports `9000,9123`.
5. Wait. The first build in GitHub Actions takes one to two hours; the server waits for it and then
   starts the testnet on its own.

Limits of the free server: all 4 validators share one machine, so the testnet is not yet
decentralized and will not reach 2,000 TPS. It is enough for wallets, Rivers Scan, Token Studio,
vesting and developers. Oracle may reclaim Always Free servers that stay almost idle for 7 days.
