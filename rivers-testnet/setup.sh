#!/bin/bash
# Copyright (c) Mysten Labs, Inc.
# SPDX-License-Identifier: Apache-2.0
#
# Sets up a Rivers public testnet on one Ubuntu server: 4 validators, a public RPC on port 9000
# and a faucet on port 9123. Paste this whole file into the "cloud-init" or "user data" box when
# creating the server; it runs once at first boot and needs no typing.
#
# Progress is written to /var/log/rivers-setup.log.

set -euo pipefail
exec > >(tee -a /var/log/rivers-setup.log) 2>&1

REPO="Abiola3625/rivers-blockchain"
HOME_DIR="/var/lib/rivers"
ARCH="$(uname -m)"
EPOCH_MS=86400000   # one epoch per day, which the RVRB reward schedule assumes

echo "Rivers setup started $(date -u)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates iptables-persistent

# Extra memory headroom for four validators on a small server.
if [ ! -f /swapfile ]; then
  fallocate -l 8G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

id rivers >/dev/null 2>&1 || useradd --system --create-home --home-dir "$HOME_DIR" --shell /usr/sbin/nologin rivers

# The build workflow publishes a new release after each code change. Wait for it if the
# first build is still running.
URL="https://github.com/$REPO/releases/latest/download/rivers-linux-$ARCH.tar.gz"
for i in $(seq 1 90); do
  if curl -fsSL -o /tmp/rivers.tgz "$URL"; then break; fi
  echo "Rivers build not published yet, checking again in 5 minutes ($i/90)"
  sleep 300
done
tar -xzf /tmp/rivers.tgz -C /tmp
install -m 755 /tmp/rivers /usr/local/bin/rivers

if [ ! -f "$HOME_DIR/net/network.yaml" ]; then
  curl -fsSL -o "$HOME_DIR/genesis-addresses.txt" \
    "https://raw.githubusercontent.com/$REPO/main/rivers-testnet/genesis-addresses.txt"
  mkdir -p "$HOME_DIR/net"
  chown -R rivers:rivers "$HOME_DIR"
  sudo -u rivers env HOME="$HOME_DIR" RIVERS_GENESIS_ADDRESSES="$HOME_DIR/genesis-addresses.txt" \
    /usr/local/bin/rivers genesis --working-dir "$HOME_DIR/net" --committee-size 4 \
    --epoch-duration-ms "$EPOCH_MS" --with-faucet
fi

cat > /etc/systemd/system/rivers.service <<UNIT
[Unit]
Description=Rivers testnet (4 validators, public RPC and faucet)
After=network-online.target
Wants=network-online.target

[Service]
User=rivers
Environment=HOME=$HOME_DIR
Environment=RUST_LOG=warn,sui_node=info
ExecStart=/usr/local/bin/rivers start --network.config $HOME_DIR/net --with-faucet=0.0.0.0:9123
Restart=always
RestartSec=10
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target
UNIT

# Ubuntu images on Oracle Cloud block incoming ports with iptables. Open RPC and faucet.
for port in 9000 9123; do
  iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null || iptables -I INPUT 5 -p tcp --dport "$port" -j ACCEPT
done
netfilter-persistent save || true

systemctl daemon-reload
systemctl enable --now rivers
echo "Rivers testnet running $(date -u). RPC: http://<server-ip>:9000  Faucet: http://<server-ip>:9123/v2/gas"
