#!/bin/bash
# Copyright (c) Mysten Labs, Inc.
# SPDX-License-Identifier: Apache-2.0
#
# Sets up a Rivers validator on one Ubuntu 24.04 server. Paste this whole file into the provider's
# "user data" or "cloud-init" box when creating the server; it runs once at first boot.
#
# Before pasting, set the three values below. Rivers Validator → Server setup shows the RPC and
# indexer addresses of the network you are joining.
#
# Server: 4 cores, 16 GB memory, 500 GB SSD, public IPv4. Open TCP 8080 and 8081, and UDP 8081,
# 8082 and 8084 in the provider's firewall.
#
# What happens:
# 1. The rivers and rivers-node programs are downloaded from the latest GitHub release.
# 2. The network's genesis file is downloaded and the validator's keys are created.
# 3. The validator node starts and follows the chain.
# 4. The validator account address and its 12 recovery words are written to
#    /var/lib/rivers/VALIDATOR.txt (readable by root only). Store the words offline.
# 5. A helper service waits until the account holds RVRB for fees, registers the validator as a
#    candidate, and requests to join the validator set once enough stake is delegated to it.
#
# Progress is written to /var/log/rivers-validator-setup.log.

VALIDATOR_NAME="my-rivers-validator"
RIVERS_RPC="https://RPC-ADDRESS-OF-THE-NETWORK"
RIVERS_INDEXER="https://INDEXER-ADDRESS-OF-THE-NETWORK"
# Optional. Rivers Validator → Launch fills these in: the validator account key made in the
# browser (the owner keeps its 12 words), and the testnet faucet that pays the registration fee.
VALIDATOR_ACCOUNT_KEY=""
RIVERS_FAUCET=""

set -euo pipefail
exec > >(tee -a /var/log/rivers-validator-setup.log) 2>&1

REPO="Abiola3625/rivers-blockchain"
DIR="/var/lib/rivers"
CFG="$DIR/client.yaml"
GAS_PRICE=1000

echo "Rivers validator setup started $(date -u)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates jq

id rivers >/dev/null 2>&1 || useradd --system --create-home --home-dir "$DIR" --shell /usr/sbin/nologin rivers
mkdir -p "$DIR/keys" "$DIR/db" "$DIR/config"

curl -fsSL -o /tmp/rivers.tgz "https://github.com/$REPO/releases/latest/download/rivers-linux-$(uname -m).tar.gz"
tar -xzf /tmp/rivers.tgz -C /tmp
install -m 755 /tmp/rivers /usr/local/bin/rivers
install -m 755 /tmp/rivers-node /usr/local/bin/rivers-node

curl -fsSL -o "$DIR/config/genesis.blob" "$RIVERS_INDEXER/network/genesis.blob"

PUBLIC_IP="$(curl -fsSL https://api.ipify.org)"

# Some cloud images (Oracle Cloud's Ubuntu among them) block every port except SSH in the server's
# own firewall, in addition to the provider's firewall.
if command -v iptables >/dev/null; then
  for rule in "tcp 8080" "tcp 8081" "udp 8081" "udp 8082" "udp 8084"; do
    set -- $rule
    iptables -C INPUT -p "$1" --dport "$2" -j ACCEPT 2>/dev/null || iptables -I INPUT -p "$1" --dport "$2" -j ACCEPT
  done
  command -v netfilter-persistent >/dev/null && netfilter-persistent save || true
fi

# Client configuration with a new Ed25519 account for the validator.
if [ ! -f "$CFG" ]; then
  echo "[]" > "$DIR/keys/account.keystore"
  cat > "$CFG" <<YAML
---
keystore:
  File: $DIR/keys/account.keystore
envs:
  - alias: rivers
    rpc: "$RIVERS_RPC"
    ws: ~
    basic_auth: ~
active_env: rivers
active_address: ~
YAML
  if [ -n "$VALIDATOR_ACCOUNT_KEY" ]; then
    # The owner made this account in Rivers Validator and holds its recovery words.
    ADDRESS="$(rivers keytool --keystore-path "$DIR/keys/account.keystore" --json import "$VALIDATOR_ACCOUNT_KEY" ed25519 | jq -r '.suiAddress')"
    WORDS="(kept by the owner, who created this account in Rivers Validator)"
  else
    NEW="$(rivers client --client.config "$CFG" new-address ed25519 --json)"
    ADDRESS="$(echo "$NEW" | jq -r '.address')"
    WORDS="$(echo "$NEW" | jq -r '.recoveryPhrase')"
  fi
  rivers client --client.config "$CFG" switch --address "$ADDRESS" >/dev/null
  umask 077
  cat > "$DIR/VALIDATOR.txt" <<TXT
Rivers validator account
Address: $ADDRESS
Recovery words: $WORDS

Store the recovery words offline, then delete this file. They control the validator account and its
self-stake. Sign in with them in Rivers Validator to change commission or the public profile.
TXT
  umask 022
fi
ADDRESS="$(grep '^Address:' "$DIR/VALIDATOR.txt" | cut -d' ' -f2)"

# Protocol, network and worker keys, and the signed validator information.
if [ ! -f "$DIR/keys/validator.info" ]; then
  (cd "$DIR/keys" && rivers validator --client.config "$CFG" make-validator-info \
    "$VALIDATOR_NAME" "Rivers validator" "" "" "$PUBLIC_IP" "$GAS_PRICE")
fi

cat > "$DIR/config/validator.yaml" <<YAML
---
protocol-key-pair:
  path: $DIR/keys/protocol.key
worker-key-pair:
  path: $DIR/keys/worker.key
network-key-pair:
  path: $DIR/keys/network.key
account-key-pair:
  path: $DIR/keys/account.key
db-path: $DIR/db/authorities_db
network-address: /ip4/0.0.0.0/tcp/8080/http
metrics-address: 127.0.0.1:9184
admin-interface-port: 1337
consensus-config:
  db-path: $DIR/db/consensus_db
p2p-config:
  listen-address: 0.0.0.0:8084
  external-address: /ip4/$PUBLIC_IP/udp/8084
genesis:
  genesis-file-location: $DIR/config/genesis.blob
authority-store-pruning-config:
  num-epochs-to-retain: 0
  num-epochs-to-retain-for-checkpoints: 2
YAML
chown -R rivers:rivers "$DIR"
chmod 600 "$DIR"/keys/*.key "$DIR/VALIDATOR.txt"

cat > /etc/systemd/system/rivers-node.service <<UNIT
[Unit]
Description=Rivers validator node
After=network-online.target
Wants=network-online.target

[Service]
User=rivers
Environment=RUST_LOG=warn,sui_node=info
ExecStart=/usr/local/bin/rivers-node --config-path $DIR/config/validator.yaml
Restart=always
RestartSec=10
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target
UNIT

# Registers the candidate once the account can pay fees, then requests to join until the chain
# accepts it (it needs the stake required to join). Each step runs once.
echo "$RIVERS_FAUCET" > "$DIR/faucet"
cat > /usr/local/bin/rivers-join <<'JOIN'
#!/bin/bash
DIR=/var/lib/rivers
CFG=$DIR/client.yaml
FAUCET="$(cat $DIR/faucet 2>/dev/null)"
ADDRESS="$(grep '^Address:' $DIR/VALIDATOR.txt | cut -d' ' -f2)"
while true; do
  if [ ! -f $DIR/.candidate ]; then
    # On the testnet the faucet pays the registration fee, so no one has to send RVRB by hand.
    if [ -n "$FAUCET" ] && [ ! -f $DIR/.funded ]; then
      curl -fsS -X POST -H 'content-type: application/json' -d "{\"FixedAmountRequest\":{\"recipient\":\"$ADDRESS\"}}" "$FAUCET" >/dev/null && touch $DIR/.funded && sleep 10
    fi
    if (cd $DIR/keys && rivers validator --client.config $CFG become-candidate validator.info) ; then
      touch $DIR/.candidate
      echo "Registered as a candidate $(date -u)"
    fi
  elif [ ! -f $DIR/.joined ]; then
    if rivers validator --client.config $CFG join-committee ; then
      touch $DIR/.joined
      echo "Requested to join the validator set $(date -u). The validator joins at the next epoch."
      exit 0
    fi
  else
    exit 0
  fi
  sleep 300
done
JOIN
chmod 755 /usr/local/bin/rivers-join
cat > /etc/systemd/system/rivers-join.service <<UNIT
[Unit]
Description=Rivers validator registration
After=rivers-node.service

[Service]
User=rivers
ExecStart=/usr/local/bin/rivers-join
Restart=on-failure
RestartSec=60

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now rivers-node rivers-join
echo "Rivers validator node running $(date -u). Account: $ADDRESS"
[ -n "$RIVERS_FAUCET" ] && echo "Next: stake the joining amount to $ADDRESS in Rivers Validator → Join." || echo "Next: send 2 RVRB to $ADDRESS for fees, then stake the joining amount to it in Rivers Validator → Join."
