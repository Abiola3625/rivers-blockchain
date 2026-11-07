// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Rivers bridge helper for the testnet. It prepares the Sui native bridge (bridge/ and
// crates/sui-bridge) for Rivers and Ethereum Sepolia:
//   keys <dir> <count>                         create one bridge key per validator, print addresses
//   register <network.yaml> <dir> <rpc> <host> [faucet]  register each validator's bridge key
//   evm-config <dir> <out.json>                 write the Sepolia deploy config for the committee
//   client-key <file> <rpc> <faucet>           create the key that submits bridge transactions on Rivers
//   token <client key> <rpc> <out.json>        publish bridged ETH on Rivers and register it with the bridge
// Bridge keys are secp256k1 private keys, stored as base64 like `sui-bridge-cli
// create-bridge-validator-key` writes them. They never leave the machine that runs the nodes.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import ethBytecode from './bridged-eth-bytecode.json' with { type: 'json' };
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';

const hex = (b) => Buffer.from(b).toString('hex');
const SERVER_PORT = 9191;

function loadKey(path) {
  const raw = Buffer.from(readFileSync(path, 'utf8').trim(), 'base64');
  // A SuiKeyPair encoding starts with a scheme flag byte; secp256k1 is 1.
  return raw.length === 33 ? raw.subarray(1) : raw;
}
function describe(priv) {
  const pub = secp256k1.getPublicKey(priv, true);
  const full = secp256k1.getPublicKey(priv, false);
  const eth = '0x' + hex(keccak_256(full.subarray(1)).subarray(12));
  return { pubkey: hex(pub), ethAddress: eth };
}
function keyFiles(dir) {
  const out = [];
  for (let i = 0; existsSync(`${dir}/bridge-key-${i}`); i++) out.push(`${dir}/bridge-key-${i}`);
  return out;
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'keys') {
  const [dir, count] = args;
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const list = [];
  for (let i = 0; i < Number(count); i++) {
    const f = `${dir}/bridge-key-${i}`;
    if (!existsSync(f)) {
      let k;
      do k = randomBytes(32); while (!secp256k1.utils.isValidSecretKey(k));
      writeFileSync(f, Buffer.from(k).toString('base64'), { mode: 0o600 });
    }
    list.push({ index: i, ...describe(loadKey(f)) });
  }
  console.log(JSON.stringify(list, null, 2));
} else if (cmd === 'register') {
  const [yaml, dir, rpc, host, faucet] = args;
  // Validator account keys in the order of network.yaml. Each validator registers the bridge key
  // with the same index, and its bridge node listens on SERVER_PORT + index.
  const accounts = [...readFileSync(yaml, 'utf8').matchAll(/account-key-pair:\s*\n\s*value:\s*(\S+)/g)].map((m) => Ed25519Keypair.fromSecretKey(Buffer.from(m[1], 'base64').subarray(1)));
  const keys = keyFiles(dir);
  if (keys.length < accounts.length) throw new Error(`Need ${accounts.length} bridge keys in ${dir}, found ${keys.length}.`);
  const client = new SuiGrpcClient({ network: 'testnet', baseUrl: rpc });
  for (let i = 0; i < accounts.length; i++) {
    const kp = accounts[i];
    const d = describe(loadKey(keys[i]));
    // Validator accounts hold little RVRB; the faucet tops them up for the registration fee.
    const bal = BigInt((await client.getBalance({ owner: kp.toSuiAddress() })).balance.balance);
    if (bal < 1_000_000_000n && faucet) {
      await fetch(faucet.replace(/\/+$/, '') + '/v2/gas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ FixedAmountRequest: { recipient: kp.toSuiAddress() } }) }).catch(() => {});
      await new Promise((r) => setTimeout(r, 3000));
    }
    const tx = new Transaction();
    tx.setSender(kp.toSuiAddress());
    tx.moveCall({ target: '0xb::bridge::committee_registration', arguments: [tx.object('0x9'), tx.object('0x5'), tx.pure.vector('u8', Buffer.from(d.pubkey, 'hex')), tx.pure.vector('u8', Buffer.from(`${host}:${SERVER_PORT + i}`))] });
    try {
      const r = await client.signAndExecuteTransaction({ transaction: tx, signer: kp, include: { effects: true } });
      const t = r.Transaction || r.FailedTransaction;
      console.log(`validator ${i} ${kp.toSuiAddress()} -> bridge ${d.ethAddress}: ${t.status.success ? 'registered' : JSON.stringify(t.status.error)}`);
    } catch (e) {
      console.log(`validator ${i}: ${e.message.slice(0, 200)}`);
    }
  }
} else if (cmd === 'evm-config') {
  const [dir, out] = args;
  const members = keyFiles(dir).map((f) => describe(loadKey(f)).ethAddress);
  // The Ethereum committee mirrors the Rivers validators with equal voting power, in basis points.
  const base = Math.floor(10000 / members.length);
  const stake = members.map((_, i) => base + (i === 0 ? 10000 - base * members.length : 0));
  const cfg = {
    committeeMemberStake: stake,
    committeeMembers: members,
    // A message needs signatures from validators holding more than half of the stake.
    minCommitteeStakeRequired: 5001,
    sourceChainId: 11, // Ethereum Sepolia in the bridge's chain numbering
    supportedChainIds: [2], // the Rivers chain (SuiCustom)
    // Testnet limit per 24 hours in US dollars with 8 decimals: 1,000,000 dollars.
    supportedChainLimitsInDollars: [100000000000000],
    // Token 0 is the native coin placeholder; token 2 is ETH, held on Sepolia as WETH.
    supportedTokens: ['0x0000000000000000000000000000000000000000', '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'],
    tokenIds: [0, 2],
    // Testnet prices used only by the transfer limiter, in US dollars with 8 decimals. They are
    // the values of the upstream Sepolia configuration in bridge/evm/deploy_configs/11155111.json.
    tokenPrices: [162000000, 430000000000],
    suiDecimals: [9, 8],
    weth: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  };
  writeFileSync(out, JSON.stringify(cfg, null, 2));
  console.log(JSON.stringify(cfg));
} else if (cmd === 'client-key') {
  // The bridge client pays Rivers fees for approvals and claims. Stored as a flagged Ed25519 key,
  // which `sui-bridge` reads with `read_key`.
  const [file, rpc, faucet] = args;
  if (!existsSync(file)) writeFileSync(file, Buffer.concat([Buffer.from([0]), randomBytes(32)]).toString('base64'), { mode: 0o600 });
  const kp = Ed25519Keypair.fromSecretKey(Buffer.from(readFileSync(file, 'utf8').trim(), 'base64').subarray(1));
  const addr = kp.toSuiAddress();
  const client = new SuiGrpcClient({ network: 'testnet', baseUrl: rpc });
  for (let i = 0; i < 5; i++) {
    const bal = BigInt((await client.getBalance({ owner: addr })).balance.balance);
    if (bal >= 20_000_000_000n) break;
    await fetch(faucet.replace(/\/+$/, '') + '/v2/gas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ FixedAmountRequest: { recipient: addr } }) }).catch(() => {});
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log(addr);
} else if (cmd === 'token') {
  // Bridged ETH (8 decimals, from bridge/move/tokens/eth). The bridge takes its treasury and
  // upgrade capabilities, so only bridge messages signed by the committee can mint it.
  const [file, rpc, out] = args;
  if (existsSync(out)) { console.log(readFileSync(out, 'utf8')); process.exit(0); }
  const kp = Ed25519Keypair.fromSecretKey(Buffer.from(readFileSync(file, 'utf8').trim(), 'base64').subarray(1));
  const client = new SuiGrpcClient({ network: 'testnet', baseUrl: rpc });
  const exec = async (tx) => {
    tx.setSender(kp.toSuiAddress());
    const r = await client.signAndExecuteTransaction({ transaction: tx, signer: kp, include: { effects: true, objectTypes: true } });
    const t = r.Transaction || r.FailedTransaction;
    if (!t.status.success) throw new Error(JSON.stringify(t.status));
    await client.waitForTransaction({ digest: t.digest });
    return t;
  };
  const tx = new Transaction();
  const [up] = tx.publish({ modules: ethBytecode.modules, dependencies: ethBytecode.dependencies });
  tx.transferObjects([up], kp.toSuiAddress());
  const t = await exec(tx);
  const ty = t.objectTypes, find = (s) => Object.keys(ty).find((k) => ty[k].includes(s));
  const pkg = Object.keys(ty).find((k) => ty[k] === 'package');
  const tx2 = new Transaction();
  tx2.moveCall({ target: '0xb::bridge::register_foreign_token', typeArguments: [pkg + '::eth::ETH'], arguments: [tx2.object('0x9'), tx2.object(find('::coin::TreasuryCap<')), tx2.object(find('::package::UpgradeCap')), tx2.object(find('::coin::CoinMetadata<'))] });
  await exec(tx2);
  const res = { package: pkg, type: pkg + '::eth::ETH', tokenId: 2 };
  writeFileSync(out, JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res));
} else {
  console.log('Commands: keys, register, evm-config, client-key, token');
  process.exit(1);
}
