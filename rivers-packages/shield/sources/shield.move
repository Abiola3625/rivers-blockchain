// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Rivers shielded payments. A `Pool<T>` holds coins of type T whose ownership is recorded as notes:
/// Poseidon commitments in a Merkle tree of depth 20. Every action is one `transact` with a Groth16
/// proof of the circuit in `circuits/transaction.circom`. It can
/// - shield: move coins in (a public deposit) and create notes;
/// - send privately: spend notes and create new notes for someone else, with no public amount;
/// - unshield: spend notes and pay coins out to a public address.
///
/// The chain sees nullifiers, new commitments, the encrypted notes for their owners, and only the
/// public amount entering or leaving the pool. It does not see which notes are spent, their owners
/// or their amounts.
///
/// The proof is bound to the recipient, the public amounts and the encrypted notes through
/// `ext_data_hash`, which this module computes itself. Nullifiers are recorded so that a note can be
/// spent once. Roots are accepted from the last `ROOT_HISTORY` insertions so that a proof made a
/// little earlier still verifies.
module rivers_shield::shield;

use std::hash::sha2_256;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use sui::groth16;
use sui::poseidon::poseidon_bn254;
use sui::table::{Self, Table};

const LEVELS: u64 = 20;
const ROOT_HISTORY: u64 = 100;
/// The BN254 scalar field. Every public input and every commitment must be below it.
const FIELD: u256 = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
const MAX_ENCRYPTED_NOTE: u64 = 512;

const EBadProof: u64 = 1;
const EUnknownRoot: u64 = 2;
const ENullifierSpent: u64 = 3;
const EBadInput: u64 = 4;
const ETreeFull: u64 = 5;
const EDepositTooLarge: u64 = 6;
const ENotEnoughInPool: u64 = 7;
const EPaused: u64 = 8;

public struct ShieldAdminCap has key, store { id: UID }

public struct Pool<phantom T> has key {
    id: UID,
    balance: Balance<T>,
    vk: groth16::PreparedVerifyingKey,
    zeros: vector<u256>,
    filled: vector<u256>,
    roots: vector<u256>,
    root_index: u64,
    next_index: u64,
    nullifiers: Table<u256, bool>,
    max_deposit: u64,
    /// Pausing stops deposits and private sends. Withdrawals always work, so funds cannot be frozen.
    deposits_paused: bool,
}

public struct NewCommitment has copy, drop {
    pool: ID,
    commitment: u256,
    index: u64,
    encrypted: vector<u8>,
}

public struct NewNullifier has copy, drop { pool: ID, nullifier: u256 }

public struct Transacted has copy, drop {
    pool: ID,
    deposit: u64,
    withdraw: u64,
    recipient: address,
    root: u256,
}

fun init(ctx: &mut TxContext) {
    transfer::public_transfer(ShieldAdminCap { id: object::new(ctx) }, ctx.sender());
}

/// Creates the pool for coin type T. `vk` is the Groth16 verifying key of the circuit in arkworks
/// compressed form; it cannot be changed afterwards.
public fun create_pool<T>(_: &ShieldAdminCap, vk: vector<u8>, max_deposit: u64, ctx: &mut TxContext) {
    let mut zeros = vector[0u256];
    let mut i = 1;
    while (i <= LEVELS) {
        let z = zeros[i - 1];
        zeros.push_back(poseidon_bn254(&vector[z, z]));
        i = i + 1;
    };
    let mut filled = vector[];
    i = 0;
    while (i < LEVELS) {
        filled.push_back(zeros[i]);
        i = i + 1;
    };
    let mut roots = vector[];
    i = 0;
    while (i < ROOT_HISTORY) {
        roots.push_back(0);
        i = i + 1;
    };
    *&mut roots[0] = zeros[LEVELS];
    transfer::share_object(Pool<T> {
        id: object::new(ctx),
        balance: balance::zero(),
        vk: groth16::prepare_verifying_key(&groth16::bn254(), &vk),
        zeros,
        filled,
        roots,
        root_index: 0,
        next_index: 0,
        nullifiers: table::new(ctx),
        max_deposit,
        deposits_paused: false,
    });
}

public fun set_deposits_paused<T>(_: &ShieldAdminCap, pool: &mut Pool<T>, paused: bool) {
    pool.deposits_paused = paused;
}

public fun set_max_deposit<T>(_: &ShieldAdminCap, pool: &mut Pool<T>, max_deposit: u64) {
    pool.max_deposit = max_deposit;
}

/// Hash that binds a proof to its external data. The browser computes the same value:
/// sha256(pool id || recipient || deposit as u64 LE || withdraw as u64 LE || u32 LE length ||
/// note 1 || u32 LE length || note 2), read as a big-endian number, modulo the field.
/// The pool id stops a proof made for one pool from being used in another pool.
public fun ext_data_hash(
    pool: ID,
    recipient: address,
    deposit: u64,
    withdraw: u64,
    encrypted1: &vector<u8>,
    encrypted2: &vector<u8>,
): u256 {
    let mut b = pool.to_bytes();
    b.append(recipient.to_bytes());
    b.append(u64_le(deposit));
    b.append(u64_le(withdraw));
    b.append(u32_le(encrypted1.length()));
    b.append(*encrypted1);
    b.append(u32_le(encrypted2.length()));
    b.append(*encrypted2);
    let h = sha2_256(b);
    let mut x = 0u256;
    h.do!(|byte| x = (x << 8) | (byte as u256));
    x % FIELD
}

/// The circuit's public amount: deposit - withdraw as a field element.
public fun public_amount(deposit: u64, withdraw: u64): u256 {
    if (deposit >= withdraw) ((deposit - withdraw) as u256) else FIELD - ((withdraw - deposit) as u256)
}

/// Verifies the proof, spends the two nullifiers, adds the two output commitments, takes the
/// deposit and pays `withdraw` to `recipient`.
public fun transact<T>(
    pool: &mut Pool<T>,
    proof: vector<u8>,
    root: u256,
    nullifiers: vector<u256>,
    commitments: vector<u256>,
    deposit: Coin<T>,
    withdraw: u64,
    recipient: address,
    encrypted1: vector<u8>,
    encrypted2: vector<u8>,
    ctx: &mut TxContext,
) {
    let dep = deposit.value();
    assert!(dep == 0 || withdraw == 0, EBadInput);
    assert!(withdraw > 0 || !pool.deposits_paused, EPaused);
    assert!(dep <= pool.max_deposit, EDepositTooLarge);
    assert!(nullifiers.length() == 2 && commitments.length() == 2, EBadInput);
    assert!(encrypted1.length() <= MAX_ENCRYPTED_NOTE && encrypted2.length() <= MAX_ENCRYPTED_NOTE, EBadInput);
    let (n0, n1, c0, c1) = (nullifiers[0], nullifiers[1], commitments[0], commitments[1]);
    assert!(n0 < FIELD && n1 < FIELD && c0 < FIELD && c1 < FIELD && root < FIELD, EBadInput);
    assert!(n0 != n1, EBadInput);
    assert!(!pool.nullifiers.contains(n0) && !pool.nullifiers.contains(n1), ENullifierSpent);
    assert!(is_known_root(pool, root), EUnknownRoot);
    assert!(withdraw <= pool.balance.value() + dep, ENotEnoughInPool);

    let id = object::id(pool);
    let ext = ext_data_hash(id, recipient, dep, withdraw, &encrypted1, &encrypted2);
    let mut inputs = vector[];
    vector[root, public_amount(dep, withdraw), ext, n0, n1, c0, c1].do!(|x| inputs.append(u256_le(x)));
    assert!(
        groth16::verify_groth16_proof(
            &groth16::bn254(),
            &pool.vk,
            &groth16::public_proof_inputs_from_bytes(inputs),
            &groth16::proof_points_from_bytes(proof),
        ),
        EBadProof,
    );

    pool.nullifiers.add(n0, true);
    pool.nullifiers.add(n1, true);
    event::emit(NewNullifier { pool: id, nullifier: n0 });
    event::emit(NewNullifier { pool: id, nullifier: n1 });
    let i0 = insert(pool, c0);
    let i1 = insert(pool, c1);
    event::emit(NewCommitment { pool: id, commitment: c0, index: i0, encrypted: encrypted1 });
    event::emit(NewCommitment { pool: id, commitment: c1, index: i1, encrypted: encrypted2 });

    pool.balance.join(deposit.into_balance());
    if (withdraw > 0) transfer::public_transfer(coin::take(&mut pool.balance, withdraw, ctx), recipient);
    event::emit(Transacted { pool: id, deposit: dep, withdraw, recipient, root });
}

fun insert<T>(pool: &mut Pool<T>, leaf: u256): u64 {
    let index = pool.next_index;
    assert!(index < (1u64 << (LEVELS as u8)), ETreeFull);
    let mut cur = index;
    let mut h = leaf;
    let mut i = 0;
    while (i < LEVELS) {
        let (l, r) = if (cur % 2 == 0) {
            *&mut pool.filled[i] = h;
            (h, pool.zeros[i])
        } else {
            (pool.filled[i], h)
        };
        h = poseidon_bn254(&vector[l, r]);
        cur = cur / 2;
        i = i + 1;
    };
    pool.root_index = (pool.root_index + 1) % ROOT_HISTORY;
    *&mut pool.roots[pool.root_index] = h;
    pool.next_index = index + 1;
    index
}

public fun is_known_root<T>(pool: &Pool<T>, root: u256): bool {
    if (root == 0) return false;
    pool.roots.contains(&root)
}

public fun current_root<T>(pool: &Pool<T>): u256 { pool.roots[pool.root_index] }

public fun is_spent<T>(pool: &Pool<T>, nullifier: u256): bool { pool.nullifiers.contains(nullifier) }

public fun size<T>(pool: &Pool<T>): u64 { pool.next_index }

public fun value<T>(pool: &Pool<T>): u64 { pool.balance.value() }

fun u64_le(x: u64): vector<u8> {
    let mut v = vector[];
    let mut i = 0;
    while (i < 8) { v.push_back(((x >> (8 * i)) & 0xff) as u8); i = i + 1; };
    v
}

fun u32_le(x: u64): vector<u8> {
    let mut v = vector[];
    let mut i = 0;
    while (i < 4) { v.push_back(((x >> (8 * i)) & 0xff) as u8); i = i + 1; };
    v
}

fun u256_le(x: u256): vector<u8> {
    let mut v = vector[];
    let mut i = 0;
    while (i < 32) { v.push_back(((x >> (8 * i)) & 0xff) as u8); i = i + 1; };
    v
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) { init(ctx) }
