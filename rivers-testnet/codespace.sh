#!/bin/bash
# Copyright (c) Mysten Labs, Inc.
# SPDX-License-Identifier: Apache-2.0
#
# Runs the Rivers testnet inside a GitHub Codespace. The codespace calls `install` once when it
# is created and `start` every time it starts, so nobody has to type commands.
# Chain data lives in /workspaces/.rivers, which survives when the codespace stops and starts.

set -euo pipefail
REPO="Abiola3625/rivers-blockchain"
DATA="${RIVERS_DATA:-/workspaces/.rivers}"
BIN="$DATA/bin/rivers"
NET="$DATA/net"
LOG="$DATA/node.log"
EPOCH_MS=86400000

install() {
  mkdir -p "$DATA/bin" "$NET"
  if [ ! -x "$BIN" ]; then
    curl -fsSL -o /tmp/rivers.tgz \
      "https://github.com/$REPO/releases/latest/download/rivers-linux-$(uname -m).tar.gz"
    tar -xzf /tmp/rivers.tgz -C "$DATA/bin"
  fi
  if [ ! -f "$NET/network.yaml" ]; then
    RIVERS_GENESIS_ADDRESSES="$PWD/rivers-testnet/genesis-addresses.txt" \
      "$BIN" genesis --working-dir "$NET" --committee-size 4 --epoch-duration-ms "$EPOCH_MS" --with-faucet
  fi
}

start() {
  [ -x "$BIN" ] || install
  if pgrep -f "rivers start" >/dev/null; then echo "Rivers testnet is already running."; return; fi
  RUST_LOG=warn nohup "$BIN" start --network.config "$NET" --with-faucet=0.0.0.0:9123 >>"$LOG" 2>&1 &
  for _ in $(seq 1 60); do curl -s -o /dev/null http://127.0.0.1:9000 && break; sleep 2; done
  # Make the two ports reachable from the internet. This can also be done in the Ports tab.
  gh codespace ports visibility 9000:public 9123:public -c "$CODESPACE_NAME" >/dev/null 2>&1 || true
  base="${CODESPACE_NAME}-PORT.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  {
    echo "Rivers testnet is running ($(date -u))."
    echo "RPC:    https://${base/PORT/9000}"
    echo "Faucet: https://${base/PORT/9123}/v2/gas"
  } | tee "$DATA/STATUS.txt"
}

"$@"
