/**
 * @fileoverview teach Vitest to run only the test cases in one shard.
 */

import { BaseSequencer } from "vitest/node";
// see https://docs.bazel.build/versions/main/test-encyclopedia.html#test-sharding
const shardCount = Number(process.env.TEST_TOTAL_SHARDS);
const shardIndex = Number(process.env.TEST_SHARD_INDEX);

class BazelSequencer extends BaseSequencer {
  sort(tests) {
    if (!shardCount) return tests;

    const minIndex = (tests.length * shardIndex) / shardCount;
    const maxIndex = (tests.length * (shardIndex + 1)) / shardCount;

    return Array.from(tests)
      .sort((testA, testB) => (testA.path > testB.path ? 1 : -1))
      .slice(minIndex, maxIndex);
  }
}

export default BazelSequencer;
