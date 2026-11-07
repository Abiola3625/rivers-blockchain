# Validator requirements

## Hardware

| Item | Minimum for the testnet |
|---|---|
| Operating system | Ubuntu 24.04 |
| CPU | 4 cores |
| Memory | 16 GB |
| Disk | 500 GB SSD |
| Network | Public IPv4 address |

## Ports

| Port | Protocol | Use |
|---|---|---|
| 8080 | TCP | Validator network |
| 8081 | TCP and UDP | Consensus |
| 8082 | UDP | Peer-to-peer |
| 8084 | UDP | State sync |

## Stake

| Rule | Value |
|---|---|
| Stake to join | 10,000 RVRB, your own or delegated |
| Removed after 7 epochs below | 5,000 RVRB |
| Removed at once below | 2,500 RVRB |
| Fees for registration | about 2 RVRB in the validator account |

## Keys

The setup script creates every key on the server: the account key (twelve recovery words), the protocol key, the network key and the worker key. Store the recovery words offline and delete the file that holds them once you have.
