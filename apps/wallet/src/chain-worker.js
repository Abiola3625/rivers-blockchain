// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Web worker for the wallet's chain check. It verifies one checkpoint per message.
import { verifyCheckpoint } from './chain-check.js';

self.onmessage = (e) => {
  const { id, job } = e.data;
  try {
    const r = verifyCheckpoint(job);
    self.postMessage({ id, r: { ...r, epoch: r.epoch.toString(), seq: r.seq.toString(), txs: r.txs.toString() } });
  } catch (err) {
    self.postMessage({ id, err: err.message });
  }
};
