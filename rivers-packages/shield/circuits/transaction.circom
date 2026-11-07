// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Rivers shielded transaction: spends up to two notes and creates two notes, with a public amount
// that enters or leaves the shielded pool. A note is Poseidon(amount, publicKey, blinding) and sits
// in a Merkle tree of depth LEVELS kept by the Move contract.
//
// The proof shows, without revealing which notes are spent or who owns them:
// - each spent note with a non-zero amount is in the tree with the given root;
// - the spender knows the private key of each spent note;
// - each nullifier is derived from its note, so a note can be spent only once;
// - the two nullifiers differ;
// - every output amount fits in 248 bits, so sums cannot wrap around the field;
// - inputs + publicAmount = outputs.
//
// extDataHash binds the proof to the recipient, the public amount and the encrypted notes chosen by
// the sender, so nobody can reuse the proof with other external data.
pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/switcher.circom";
include "circomlib/circuits/comparators.circom";

template MerkleRoot(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices;
    signal output root;

    component bits = Num2Bits(levels);
    bits.in <== pathIndices;
    component sw[levels];
    component h[levels];
    for (var i = 0; i < levels; i++) {
        sw[i] = Switcher();
        sw[i].L <== i == 0 ? leaf : h[i - 1].out;
        sw[i].R <== pathElements[i];
        sw[i].sel <== bits.out[i];
        h[i] = Poseidon(2);
        h[i].inputs[0] <== sw[i].outL;
        h[i].inputs[1] <== sw[i].outR;
    }
    root <== h[levels - 1].out;
}

template Transaction(levels, nIns, nOuts) {
    signal input root;
    signal input publicAmount;
    signal input extDataHash;
    signal input inputNullifier[nIns];
    signal input outputCommitment[nOuts];

    signal input inAmount[nIns];
    signal input inPrivateKey[nIns];
    signal input inBlinding[nIns];
    signal input inPathIndices[nIns];
    signal input inPathElements[nIns][levels];

    signal input outAmount[nOuts];
    signal input outPubkey[nOuts];
    signal input outBlinding[nOuts];

    component inKey[nIns];
    component inCommit[nIns];
    component inSig[nIns];
    component inNull[nIns];
    component inTree[nIns];
    component inCheck[nIns];
    var sumIns = 0;

    for (var i = 0; i < nIns; i++) {
        inKey[i] = Poseidon(1);
        inKey[i].inputs[0] <== inPrivateKey[i];

        inCommit[i] = Poseidon(3);
        inCommit[i].inputs[0] <== inAmount[i];
        inCommit[i].inputs[1] <== inKey[i].out;
        inCommit[i].inputs[2] <== inBlinding[i];

        inSig[i] = Poseidon(3);
        inSig[i].inputs[0] <== inPrivateKey[i];
        inSig[i].inputs[1] <== inCommit[i].out;
        inSig[i].inputs[2] <== inPathIndices[i];

        inNull[i] = Poseidon(3);
        inNull[i].inputs[0] <== inCommit[i].out;
        inNull[i].inputs[1] <== inPathIndices[i];
        inNull[i].inputs[2] <== inSig[i].out;
        inNull[i].out === inputNullifier[i];

        inTree[i] = MerkleRoot(levels);
        inTree[i].leaf <== inCommit[i].out;
        inTree[i].pathIndices <== inPathIndices[i];
        for (var j = 0; j < levels; j++) {
            inTree[i].pathElements[j] <== inPathElements[i][j];
        }

        // Notes with amount zero are padding and need not be in the tree.
        inCheck[i] = ForceEqualIfEnabled();
        inCheck[i].in[0] <== root;
        inCheck[i].in[1] <== inTree[i].root;
        inCheck[i].enabled <== inAmount[i];

        sumIns += inAmount[i];
    }

    component outCommit[nOuts];
    component outRange[nOuts];
    var sumOuts = 0;
    for (var i = 0; i < nOuts; i++) {
        outCommit[i] = Poseidon(3);
        outCommit[i].inputs[0] <== outAmount[i];
        outCommit[i].inputs[1] <== outPubkey[i];
        outCommit[i].inputs[2] <== outBlinding[i];
        outCommit[i].out === outputCommitment[i];

        outRange[i] = Num2Bits(248);
        outRange[i].in <== outAmount[i];

        sumOuts += outAmount[i];
    }

    // Inputs are also range checked so that a spent note cannot carry a wrapped amount.
    component inRange[nIns];
    for (var i = 0; i < nIns; i++) {
        inRange[i] = Num2Bits(248);
        inRange[i].in <== inAmount[i];
    }

    component same[nIns * (nIns - 1) / 2];
    var k = 0;
    for (var i = 0; i < nIns - 1; i++) {
        for (var j = i + 1; j < nIns; j++) {
            same[k] = IsEqual();
            same[k].in[0] <== inputNullifier[i];
            same[k].in[1] <== inputNullifier[j];
            same[k].out === 0;
            k++;
        }
    }

    sumIns + publicAmount === sumOuts;

    // A constraint that uses extDataHash, so the compiler keeps it bound to the proof.
    signal extDataSquare <== extDataHash * extDataHash;
}

component main {public [root, publicAmount, extDataHash, inputNullifier, outputCommitment]} = Transaction(20, 2, 2);
