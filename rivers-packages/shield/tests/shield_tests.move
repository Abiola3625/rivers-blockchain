// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Tests with real Groth16 proofs of circuits/transaction.circom, made with the testnet proving key
/// by js/shield.mjs and snarkjs: Alice shields 1,000, sends 700 to Bob privately, and Bob unshields
/// 500 to 0xb0b. The proofs are bound to the pool created in `setup`, so the setup must keep the
/// same transaction sequence for the pool to get the same id.
#[test_only]
module rivers_shield::shield_tests;

use rivers_shield::shield::{Self, Pool, ShieldAdminCap};
use sui::coin::{Self, Coin};
use sui::test_scenario::{Self as ts, Scenario};

public struct T has drop {}

const ADMIN: address = @0xAD;
const VK: vector<u8> = x"1714ca2392afc4fb3ab257c56206df3026e9a30977d31d156b403aa8848b3dab9bae9a76e45c700bf6b19cbb1d7076935fe3f52bd76b993e5281a1cb740ab6025c6c013cc8fabf7f5aadd0c2d6deee5c86c85b4fb7701ae3e4d386f28d0d702aedf692d95cbdde46ddda5ef7d422436779445c5e66006a42761e1f12efde0018c212f3aeb785e49712e7a9353349aaf1255dfb31b7bf60723a480d9293938e1962e0ba6b87087858e4d79e62324f75e2f2c9c78e9ba956e2cbb8758b3806d41c3b2f7b615258b6fb2420a07b05d9e3bb5799f86170530e07ef12e08ceb15028c0800000000000000084e55ac958734ee34d6c5c8f5ffae1ba3064d6ead2420ec214794974a40162f83a93a448a69c2262f58d394e9e9287610b036d1031e822e81c89bfd6c75b68dafec888c205938ddc66d70daa571abd919929043a506a2309d8dad634687bd12ca80bc67dc9aef08e4b2a8e10fb34faf614c152371f142d5dbf75465335b2c98823e73bc95810d9abf78db13e858fc38f0262361718eace2e7ad4ffaa32a540d790f4185e2d0d45fe9a0e9981596e1c9265199a7fed3573759b888b737044c9d664f7466a9e23f7d0a15522f3bccf2723b5cabbc655cb0b8512be78d1fe10310bc2fdc2000ada7fc175aa6a6ad53b7f6d4b7fddacb2b7b1a5f38bb28506b1f20";

fun setup(): (Scenario, Pool<T>) {
    let mut s = ts::begin(ADMIN);
    shield::init_for_testing(s.ctx());
    s.next_tx(ADMIN);
    let cap = s.take_from_sender<ShieldAdminCap>();
    shield::create_pool<T>(&cap, VK, 1_000_000, s.ctx());
    s.return_to_sender(cap);
    s.next_tx(ADMIN);
    let p = s.take_shared<Pool<T>>();
    (s, p)
}

fun finish(s: Scenario, p: Pool<T>) {
    ts::return_shared(p);
    s.end();
}

fun admin_cap(s: &mut Scenario): ShieldAdminCap {
    s.next_tx(ADMIN);
    s.take_from_sender<ShieldAdminCap>()
}

#[test]
fun shield_send_and_unshield() {
    let (mut s, mut p) = setup();
    let empty = shield::current_root(&p);
    deposit_call(&mut s, &mut p, @0xa11ce);
    assert!(shield::value(&p) == 1000);
    assert!(shield::size(&p) == 2);
    assert!(shield::current_root(&p) == DEPOSIT_ROOT_AFTER);
    assert!(shield::is_known_root(&p, empty));
    send_call(&mut s, &mut p, @0x0);
    assert!(shield::value(&p) == 1000);
    assert!(shield::size(&p) == 4);
    assert!(shield::current_root(&p) == SEND_ROOT_AFTER);
    withdraw_call(&mut s, &mut p, @0xb0b);
    assert!(shield::value(&p) == 500);
    assert!(shield::size(&p) == 6);
    assert!(shield::current_root(&p) == WITHDRAW_ROOT_AFTER);
    s.next_tx(@0xb0b);
    let paid = s.take_from_sender<Coin<T>>();
    assert!(paid.value() == 500);
    coin::burn_for_testing(paid);
    finish(s, p);
}

#[test, expected_failure(abort_code = shield::ENullifierSpent)]
fun note_cannot_be_spent_twice() {
    let (mut s, mut p) = setup();
    deposit_call(&mut s, &mut p, @0xa11ce);
    send_call(&mut s, &mut p, @0x0);
    send_call(&mut s, &mut p, @0x0);
    finish(s, p);
}

#[test, expected_failure(abort_code = shield::EBadProof)]
fun recipient_cannot_be_changed() {
    let (mut s, mut p) = setup();
    deposit_call(&mut s, &mut p, @0xa11ce);
    send_call(&mut s, &mut p, @0x0);
    withdraw_call(&mut s, &mut p, @0xbad);
    finish(s, p);
}

#[test, expected_failure(abort_code = shield::EBadProof)]
fun proof_for_one_pool_fails_in_another() {
    let (mut s, p) = setup();
    let cap = admin_cap(&mut s);
    shield::create_pool<T>(&cap, VK, 1_000_000, s.ctx());
    s.return_to_sender(cap);
    s.next_tx(ADMIN);
    // Take the second pool: the first one is still held by this test.
    let mut other = s.take_shared<Pool<T>>();
    assert!(object::id(&other) != object::id(&p));
    deposit_call(&mut s, &mut other, @0xa11ce);
    ts::return_shared(other);
    finish(s, p);
}

#[test, expected_failure(abort_code = shield::EUnknownRoot)]
fun root_must_be_known() {
    let (mut s, mut p) = setup();
    deposit_call(&mut s, &mut p, @0xa11ce);
    // This proof was made against the tree after the private send, which has not happened.
    withdraw_call(&mut s, &mut p, @0xb0b);
    finish(s, p);
}

#[test, expected_failure(abort_code = shield::EPaused)]
fun pause_stops_deposits() {
    let (mut s, mut p) = setup();
    let cap = admin_cap(&mut s);
    shield::set_deposits_paused(&cap, &mut p, true);
    s.return_to_sender(cap);
    deposit_call(&mut s, &mut p, @0xa11ce);
    finish(s, p);
}

#[test]
fun withdrawal_works_while_paused() {
    let (mut s, mut p) = setup();
    deposit_call(&mut s, &mut p, @0xa11ce);
    send_call(&mut s, &mut p, @0x0);
    let cap = admin_cap(&mut s);
    shield::set_deposits_paused(&cap, &mut p, true);
    s.return_to_sender(cap);
    withdraw_call(&mut s, &mut p, @0xb0b);
    assert!(shield::value(&p) == 500);
    finish(s, p);
}

#[test, expected_failure(abort_code = shield::EDepositTooLarge)]
fun deposit_limit_applies() {
    let (mut s, mut p) = setup();
    let cap = admin_cap(&mut s);
    shield::set_max_deposit(&cap, &mut p, 999);
    s.return_to_sender(cap);
    deposit_call(&mut s, &mut p, @0xa11ce);
    finish(s, p);
}

#[test]
fun ext_data_hash_is_below_the_field() {
    let h = shield::ext_data_hash(object::id_from_address(@0x1), @0x2, 3, 4, &x"0506", &x"07");
    assert!(h < 21888242871839275222246405745257275088548364400416034343698204186575808495617);
}

// ---------- calls with the generated proofs ----------

fun deposit_call(s: &mut Scenario, p: &mut Pool<T>, recipient: address) {
    let coin = coin::mint_for_testing<T>(1000, s.ctx());
    shield::transact(p, x"055356a409291cc88a8bf1c92d0f36f130059bc2e649d33f878a9d7f3b80f602bff798d8be949e25867d72d1305a1a9f2b231153c0db1fa47cb888839b59db0df12274ec8509f8b27ae521a071e2c29173036c52515f0297f05636aa084d969abac51cf54acd7ae74b651d98a4e1b6149f86995af01316ce96447ed1037bb21b", 15019797232609675441998260052101280400536945603062888308240081994073687793470, vector[9403475845587225423989136382713041461930629222859220164192216723530806696525, 8433862339751375975278736200541547993535378757377029298724970710306403156691], vector[17368534199265664438525013999166572755961307128843836432688812487819477602137, 10095725804606016675604981538978768787011446554334244102498406615031875500226], coin, 0, recipient, x"bba01a2df2a76ab319e852f6585c53119478d309f6176101faf84574f142b410799477b98111620191dcf32401561832945a8a6b6a423819f8d43f2171ebf7851996ffa77857fe4acc9448856782939de35c1dd5947eb55aaa058ec2c143b6cbac0a5cb8db4516558df73012b71957e8749f5597b89a345142843af52f35fe5fbbc361fb69126f55", x"bbda8dbc6ccabcb8a30b87bff3eb766f5590d83c6b58ecd41d4b8f0f39f5a616baefc247c38c6d1699f34897a7a7233a93e5c25a597dd34bdbd902fccb0c8a3a3483a18ecee7a39d34ce46917926d94713820121c9014fd5c31a6ddae624fa36cc1106362b5a84ad80cbb1e3832038d361a377b4d14411d6f80c00a67f6749de0d6eb6357f03dcd4", s.ctx());
}
const DEPOSIT_ROOT_AFTER: u256 = 3812778785746977670113822081590835530300513908860504680281228992986422034515;

fun send_call(s: &mut Scenario, p: &mut Pool<T>, recipient: address) {
    let coin = coin::mint_for_testing<T>(0, s.ctx());
    shield::transact(p, x"c1ed1f84bdc35ffc12ffbb283b0f0d333fd27443f34fa7562b58a5bdf2e982ab182b6d2b1d3351e097456ed20316dd7e0a95b1df94d0d923e4774331dca55d265670b533b89bca9aadd02788f14365322f0dc7bab0cf462b47ae6f6f9f35cf8e35de4ca333c59d15820b6317a9019fe721a32917781606d2862f5030c4d4482b", 3812778785746977670113822081590835530300513908860504680281228992986422034515, vector[11509614648696243527271960209668347057336000925193529734268997409286161818055, 6994257295611591828626144657186359851541505157470375317485649027300522949039], vector[15810753717129926982559221221991238662607629961721557365266923527209744566327, 8743038016058200411958604634294849358239122254048986598231211047930380693446], coin, 0, recipient, x"4a9c2682c2a4895a16bb27f5c951e70efc0e53c9640391cca795f74fe58e6b67f909a33ef5db1e3330288562da9a87666faa5ccb1c5dc45f3acd81ce04d2281c74f6f94e37ffd9110f95f72fbe25e82935b48df242da6e78cf672ef6b95bb123ed538e56b9db2b0d54ce2067ba9190f88f0311f06658e8d7a7dbda9ae772e8fb6963089f9ae49c37", x"090493b908daabb497b812d7ee10e6651bba7a1ae4a7e7024c2cda61bb7a453f88bcd172a768fd2fd63e34e7def6df42b6fa605d41584499db56d8e0430d1d94257d78b376e840fde1c601a2a107ce40a79bcd41ea396c99db5b9fed406a850f1b97ea92f69066965d58ce32867ff7a120164cca0a3059f589afe80a33d9d7effa6a9df8b4c1b229", s.ctx());
}
const SEND_ROOT_AFTER: u256 = 15950813271488855915333518345769040433705805118771558535340577500862651652084;

fun withdraw_call(s: &mut Scenario, p: &mut Pool<T>, recipient: address) {
    let coin = coin::mint_for_testing<T>(0, s.ctx());
    shield::transact(p, x"938d9da767fbb308146b9b84031335d559c865e173f44cb8368094f0999ebb0a93072ca28d2f4beb8f5d65ad1fbdb28126665d44835e66d957c45ca4588bd80d2fe0a600ba9186fed90a38ae2bf6b7f03a7342178b9211e3f4a33aeb9c1ce612e772577f798f297c664e0ad5b99c08fa6fe71ceddb39aa5541303db290861aa7", 15950813271488855915333518345769040433705805118771558535340577500862651652084, vector[6986594166931812155328776992964629387361945657827866328635880487404452655314, 21323052576148102208127590392282796365526861219965771016475798358192140445739], vector[16733189664756813322464899402069656013207822931939250455582439044010927161800, 6355536021175550442683698519965217366954474450640793837606024148946444755979], coin, 500, recipient, x"38fe2d9582b7ca7966075c920907f9e02696b70c7fe323928b7c83a712810b0f4a541f8a013594c1f0af5bafc5be2f76c67142076155cfdbfb856932e093b5a4807596f5a59ebae56748669b0c3decdeca5ca6ff93cd47c6d5c49cefe1530a3307fc21fcb14ea417bd68239052715bbabc86aad2b94b8727876ad628b3b8ea35f7400d24000be087", x"b44a90699135def855f8604077bde08154ae53be82f2f5d5a6a1d74d195fc0119f757c3d930587a05793db94563de83028689d4cd45a40b743542fab2a9e866e5cae5a0167e59cbde3d16f4f7de5a02b143cc8ccc661900ff173f851bd66472f7e5e724efcb90844a7ed3561882b79956d7161c9333572d57fe643a5d9ef92aebb287a126c7e5444", s.ctx());
}
const WITHDRAW_ROOT_AFTER: u256 = 10037746727845575425171182497010329842746686704251376023383133266626172222334;
