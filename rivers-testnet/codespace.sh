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

# Wallet activity: like other public testnets, wallets send test RVRB to each other all the time.
# A dedicated reserve wallet holds a 10,000 RVRB allocation that pays for this activity only. It funds
# a growing pool of wallets (12 at the start, a new one every few minutes, up to 500), which then send
# small random amounts to each other every 1 to 4 seconds. Activity transactions use a gas budget of
# exactly 42,424,242 drops so that tools can tell them apart from transactions of real users.
ACT="$DATA/activity"
ACT_START=12
ACT_MAX=500
ACT_RESERVE=10000000000000
ACT_BUDGET=42424242
CLI() { "$BIN" client --client.config "$1" "${@:2}"; }
json_field() { grep -o "\"$1\": *\"[^\"]*\"" | head -1 | cut -d'"' -f4; }
act_new_wallet() {
  local out mn addr n
  n=$(($(wc -l < "$ACT/wallets.txt") + 1))
  out=$(cd "$ACT" && "$BIN" keytool generate ed25519 --json) || return 1
  rm -f "$ACT"/*.key
  mn=$(echo "$out" | json_field mnemonic)
  addr=$(echo "$out" | json_field suiAddress)
  [ -n "$addr" ] || return 1
  "$BIN" keytool --keystore-path "$ACT/activity.keystore" import "$mn" ed25519 --alias "activity-$n" >/dev/null || return 1
  echo "activity-$n=$addr" >> "$ACT/wallets.txt"
  echo "$addr"
}
act_send() { # from-alias, to-address, drops
  CLI "$ACT/client.yaml" switch --address "$1" >/dev/null 2>&1 &&
    CLI "$ACT/client.yaml" ptb --split-coins gas "[$3]" --assign c --transfer-objects "[c]" "@$2" \
      --gas-budget "$ACT_BUDGET" >/dev/null 2>&1
}
activity_setup() {
  mkdir -p "$ACT"
  [ -f "$ACT/funded" ] && return 0
  rm -f "$ACT/activity.keystore" "$ACT/activity.aliases" && : > "$ACT/wallets.txt"
  # The key tool reads a default client config; create an empty one the first time.
  local cfg="$HOME/.sui/sui_config" i addr reserve got=0 a coins amounts="" args=""
  if [ ! -f "$cfg/client.yaml" ]; then
    mkdir -p "$cfg" && echo "[]" > "$cfg/sui.keystore"
    printf -- "---\nkeystore:\n  File: %s\nexternal_keys: ~\nenvs:\n  - alias: localnet\n    rpc: \"http://127.0.0.1:9000\"\n    ws: ~\n    basic_auth: ~\nactive_env: localnet\nactive_address: ~\n" "$cfg/sui.keystore" > "$cfg/client.yaml"
  fi
  reserve=$(act_new_wallet) || return 1
  cat > "$ACT/client.yaml" <<YAML
---
keystore:
  File: $ACT/activity.keystore
external_keys: ~
envs:
  - alias: localnet
    rpc: "http://127.0.0.1:9000"
    ws: ~
    basic_auth: ~
active_env: localnet
active_address: "$reserve"
YAML
  # The 10,000 RVRB allocation comes from two untouched genesis test accounts of 5,000 RVRB each.
  for a in $(CLI "$NET/client.yaml" addresses --json | grep -o '0x[0-9a-f]\{64\}' | sort -u); do
    [ "$a" = "$(CLI "$NET/client.yaml" active-address)" ] && continue
    coins=$(CLI "$NET/client.yaml" gas "$a" --json | grep -o '"gasCoinId": *"0x[0-9a-f]*"' | cut -d'"' -f4)
    total=$(CLI "$NET/client.yaml" gas "$a" --json | grep -o '"mistBalance": *"\?[0-9]*' | grep -o '[0-9]*$' | awk '{s+=$1} END {print s}')
    [ "$total" = "5000000000000" ] || continue
    # shellcheck disable=SC2086
    CLI "$NET/client.yaml" pay-all-sui --input-coins $coins --recipient "$reserve" --gas-budget "$ACT_BUDGET" >/dev/null || continue
    got=$((got + 1)); [ "$got" -ge 2 ] && break
  done
  [ "$got" -ge 2 ] || return 1
  # The reserve gives each starting wallet 100 test RVRB, in one transaction.
  for i in $(seq 2 "$ACT_START"); do
    addr=$(act_new_wallet) || return 1
    amounts="$amounts${amounts:+,}100000000000"
    args="$args --transfer-objects [c.$((i - 2))] @$addr"
  done
  # shellcheck disable=SC2086
  CLI "$ACT/client.yaml" ptb --split-coins gas "[$amounts]" --assign c $args --gas-budget "$ACT_BUDGET" >/dev/null &&
    touch "$ACT/funded"
}
activity_loop() {
  local n i j drops addr
  while true; do
    mapfile -t W < <(cut -d= -f1 "$ACT/wallets.txt")
    mapfile -t A < <(cut -d= -f2 "$ACT/wallets.txt")
    n=${#A[@]}
    if [ "$n" -lt "$ACT_MAX" ] && [ $((RANDOM % 80)) -eq 0 ]; then
      addr=$(act_new_wallet) && act_send activity-1 "$addr" 20000000000 || true   # a new wallet joins
    elif [ $((RANDOM % 25)) -eq 0 ]; then
      act_send activity-1 "${A[$((1 + RANDOM % (n - 1)))]}" 20000000000 || true   # reserve top-up
    else
      i=$((1 + RANDOM % (n - 1))); j=$((1 + (i + RANDOM % (n - 2)) % (n - 1)))
      drops=$(((RANDOM % 400 + 1) * 10000000))
      act_send "${W[$i]}" "${A[$j]}" "$drops" || true
    fi
    sleep $((RANDOM % 4 + 1))
  done
}

# The indexer stores accounts, activity history and validator rewards for Rivers Scan. It needs
# Node.js 22.13 or later for the built-in SQLite module, so a copy of Node is kept in $DATA/node.
NODE_VER=v22.14.0
NODE="$DATA/node/bin/node"
indexer_start() {
  if [ ! -x "$NODE" ]; then
    local arch; arch=$(uname -m); arch=${arch/x86_64/x64}; arch=${arch/aarch64/arm64}
    mkdir -p "$DATA/node"
    curl -fsSL "https://nodejs.org/dist/$NODE_VER/node-$NODE_VER-linux-$arch.tar.xz" | tar -xJ -C "$DATA/node" --strip-components=1
  fi
  pkill -f "rivers-indexer.mjs" >/dev/null 2>&1 || true
  RIVERS_INDEXER_DB="$DATA/indexer.db" RIVERS_DEX_CONFIG="$DATA/dex.json" RIVERS_NETWORK_DIR="$NET" NODE_NO_WARNINGS=1 \
    RIVERS_BRIDGE_DIR="$DATA/bridge" RIVERS_BRIDGE_DEPLOYMENT="$PWD/rivers-testnet/bridge/sepolia.json" \
    nohup "$NODE" "$PWD/rivers-testnet/indexer/dist/rivers-indexer.mjs" >>"$DATA/indexer.log" 2>&1 &
}

# Rivers DEX: publishes the DEX package and the USDs and NGNs test stablecoins once, then creates the
# first pools. The starting prices are testnet prices with no real value.
RVRB_PRICE_USDS=1
USDS_PRICE_NGNS=1500
dex_setup() {
  # The setup is complete when the last step, the shielded pools, has handed over its capability.
  [ -f "$DATA/dex.json" ] && grep -q '"ready": true' "$DATA/dex.json" && grep -q '"capHanded": true' "$DATA/dex.json" && return 0
  mkdir -p "$DATA/dex"
  for _ in 1 2 3 4 5; do
    RIVERS_DEX_CONFIG="$DATA/dex.json" RIVERS_DEX_KEY="$DATA/dex/key.txt" NODE_NO_WARNINGS=1 \
      RIVERS_PRICE_RVRB_USDS="$RVRB_PRICE_USDS" RIVERS_PRICE_USDS_NGNS="$USDS_PRICE_NGNS" \
      "$NODE" "$PWD/rivers-testnet/indexer/dist/rivers-dex-setup.mjs" >>"$DATA/dex.log" 2>&1 && return 0
    sleep 30
  done
  return 1
}

# Installs a newer release of the rivers program when the build workflow has published one. The chain
# data is kept; only the program is replaced and the node restarts.
# Bridge to Ethereum Sepolia. Each validator gets a bridge key and registers it on Rivers; the
# committee forms at the next epoch change. The public keys are served by the indexer at /bridge
# so the Sepolia contracts can be deployed for the same committee. The keys stay in $DATA/bridge.
bridge_setup() {
  local B="$DATA/bridge" H="$PWD/rivers-testnet/indexer/dist/rivers-bridge.mjs" n
  mkdir -p "$B" && chmod 700 "$B"
  n=$(grep -c "account-key-pair:" "$NET/network.yaml")
  NODE_NO_WARNINGS=1 "$NODE" "$H" keys "$B/keys" "$n" > "$B/committee.json.new" && mv "$B/committee.json.new" "$B/committee.json"
  if [ ! -f "$B/registered" ]; then
    NODE_NO_WARNINGS=1 "$NODE" "$H" register "$NET/network.yaml" "$B/keys" http://127.0.0.1:9000 http://127.0.0.1 http://127.0.0.1:9123 | tee -a "$B/register.log"
    [ "$(grep -c ': registered' "$B/register.log")" -ge "$n" ] && touch "$B/registered"
  fi
  NODE_NO_WARNINGS=1 "$NODE" "$H" client-key "$B/client.key" http://127.0.0.1:9000 http://127.0.0.1:9123 > "$B/client.address"
}

# Starts one bridge node per validator once the Sepolia contracts are deployed
# (rivers-testnet/bridge/sepolia.json) and the release has the bridge program. Node 0 also runs
# the client that submits approvals and claims on Rivers. The first time, it publishes bridged ETH
# on Rivers and asks the committee to approve it as token 2.
bridge_nodes() {
  local B="$DATA/bridge" H="$PWD/rivers-testnet/indexer/dist/rivers-bridge.mjs" D="$PWD/rivers-testnet/bridge/sepolia.json"
  local CLI="$DATA/bin/rivers-bridge-cli" NB="$DATA/bin/rivers-bridge" ETH_RPC="${RIVERS_SEPOLIA_RPC:-https://ethereum-sepolia-rpc.publicnode.com}"
  [ -f "$D" ] && [ -x "$NB" ] && [ -x "$CLI" ] || { echo "Bridge: waiting for the Sepolia deployment and the bridge program"; return 0; }
  local proxy start n i
  proxy=$(json_field suiBridge < "$D"); start=$(grep -o '"startBlock": *[0-9]*' "$D" | grep -o '[0-9]*$')
  NODE_NO_WARNINGS=1 "$NODE" "$H" token "$B/client.key" http://127.0.0.1:9000 "$B/eth-token.json" >/dev/null || return 1
  local pkg; pkg=$(json_field package < "$B/eth-token.json"); pkg=${pkg#0x}
  n=$(ls "$B/keys" | grep -c bridge-key-)
  mkdir -p "$B/db"
  for i in $(seq 0 $((n - 1))); do
    {
      echo "server-listen-port: $((9191 + i))"
      echo "metrics-port: $((9300 + i))"
      echo "bridge-authority-key-path: $B/keys/bridge-key-$i"
      if [ "$i" = 0 ]; then echo "run-client: true"; echo "db-path: $B/db"; else echo "run-client: false"; fi
      echo "approved-governance-actions:"
      echo "  - AddTokensOnSuiAction: { nonce: 0, chain_id: SuiCustom, native: false, token_ids: [2], token_type_names: [{ struct: { address: \"$pkg\", module: eth, name: ETH, type_args: [] } }], token_prices: [430000000000] }"
      echo "sui: { sui-rpc-url: http://127.0.0.1:9000, sui-bridge-chain-id: 2, bridge-client-key-path: $B/client.key }"
      echo "eth: { eth-rpc-urls: [$ETH_RPC], eth-rpc-quorum: 1, eth-health-check-interval-secs: 300, eth-bridge-proxy-address: \"$proxy\", eth-bridge-chain-id: 11, eth-contracts-start-block-fallback: $start }"
    } > "$B/node-$i.yaml"
    pgrep -f "rivers-bridge --config-path $B/node-$i.yaml" >/dev/null || RUST_LOG=info nohup "$NB" --config-path "$B/node-$i.yaml" >>"$B/node-$i.log" 2>&1 &
  done
  # Governance needs the committee, which forms at the epoch change after registration.
  if [ ! -f "$B/token-approved" ]; then
    [ -f "$B/eth.key" ] || { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n' > "$B/eth.key"; chmod 600 "$B/eth.key"; }
    printf 'sui-rpc-url: http://127.0.0.1:9000\neth-rpc-url: %s\neth-bridge-proxy-address: "%s"\nsui-key-path: %s\neth-key-path: %s\n' "$ETH_RPC" "$proxy" "$B/client.key" "$B/eth.key" > "$B/cli.yaml"
    sleep 10
    "$CLI" governance --config-path "$B/cli.yaml" --chain-id 2 add-tokens-on-sui --nonce 0 --token-ids 2 \
      --token-type-names "0x$pkg::eth::ETH" --token-prices 430000000000 >>"$B/governance.log" 2>&1 \
      && grep -q "Sui Transaction succeeded" "$B/governance.log" && touch "$B/token-approved" \
      || echo "Bridge: ETH not approved yet (the committee forms at the next epoch); start again later"
  fi
}

update_bin() {
  local tag
  tag=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null | grep -o '"tag_name": *"[^"]*"' | cut -d'"' -f4)
  [ -n "$tag" ] || return 0
  [ "$(cat "$DATA/bin/version" 2>/dev/null)" = "$tag" ] && return 0
  if [ -f "$DATA/bin/version" ] || [ "${1:-}" = force ]; then
    curl -fsSL -o /tmp/rivers-new.tgz "https://github.com/$REPO/releases/download/$tag/rivers-linux-$(uname -m).tar.gz" || return 0
    mkdir -p /tmp/rivers-new && tar -xzf /tmp/rivers-new.tgz -C /tmp/rivers-new || return 0
    pkill -f "rivers start" >/dev/null 2>&1 && sleep 5
    install -m 755 /tmp/rivers-new/rivers "$BIN"
    for b in rivers-bridge rivers-bridge-cli; do [ -f "/tmp/rivers-new/$b" ] && install -m 755 "/tmp/rivers-new/$b" "$DATA/bin/$b"; done
    echo "Installed rivers $tag"
  fi
  echo "$tag" > "$DATA/bin/version"
}

start() {
  git pull --ff-only >/dev/null 2>&1 || true
  [ -x "$BIN" ] || install
  update_bin force
  if ! pgrep -f "rivers start" >/dev/null; then
    RUST_LOG=warn nohup "$BIN" start --network.config "$NET" --with-faucet=0.0.0.0:9123 >>"$LOG" 2>&1 &
  fi
  for _ in $(seq 1 60); do curl -s -o /dev/null http://127.0.0.1:9000 && break; sleep 2; done
  if ! pgrep -f "codespace.sh activity_loop" >/dev/null; then
    if activity_setup >>"$DATA/activity.log" 2>&1; then
      nohup bash "$0" activity_loop >>"$DATA/activity.log" 2>&1 &
    else
      echo "Testnet activity did not start; see $DATA/activity.log" >&2
    fi
  fi
  indexer_start || echo "Indexer did not start; see $DATA/indexer.log" >&2
  pgrep -f "rivers-dex-setup.mjs" >/dev/null || nohup bash "$0" dex_setup >/dev/null 2>&1 &
  bridge_setup >>"$DATA/bridge.log" 2>&1 || echo "Bridge setup did not finish; see $DATA/bridge.log" >&2
  bridge_nodes >>"$DATA/bridge.log" 2>&1 || echo "Bridge nodes did not start; see $DATA/bridge.log" >&2
  # The keeper keeps the Rivers Lend price observations fresh.
  pgrep -f "rivers-keeper.mjs" >/dev/null || RIVERS_DEX_CONFIG="$DATA/dex.json" RIVERS_DEX_KEY="$DATA/dex/key.txt" NODE_NO_WARNINGS=1 \
    nohup "$NODE" "$PWD/rivers-testnet/indexer/dist/rivers-keeper.mjs" >>"$DATA/keeper.log" 2>&1 &
  # Make the ports reachable from the internet. This can also be done in the Ports tab.
  gh codespace ports visibility 9000:public 9123:public 9200:public -c "$CODESPACE_NAME" >/dev/null 2>&1 || true
  base="${CODESPACE_NAME}-PORT.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  {
    echo "Rivers testnet is running ($(date -u))."
    echo "RPC:    https://${base/PORT/9000}"
    echo "Faucet: https://${base/PORT/9123}/v2/gas"
    echo "Indexer: https://${base/PORT/9200}/status"
  } | tee "$DATA/STATUS.txt"
}

"$@"
