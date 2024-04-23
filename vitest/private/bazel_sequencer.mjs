import * as fs from "fs";
import { resolve } from "path";
import { createHash } from "node:crypto";
import { BaseSequencer } from "vitest/node";

// see https://docs.bazel.build/versions/main/test-encyclopedia.html#test-sharding
const shardCount = Number(process.env.TEST_TOTAL_SHARDS);
const shardIndex = Number(process.env.TEST_SHARD_INDEX);
const shardStatusFile = process.env.TEST_SHARD_STATUS_FILE;

class BazelSequencer extends BaseSequencer {
  ctx;

  constructor(ctx) {
    super(ctx);
    this.ctx = ctx;
    // Sharding protocol:
    // Tell Bazel that this test runner supports sharding by updating the last modified date of the
    // magic file
    if (shardCount) {
      fs.open(shardStatusFile, "w", (err, fd) => {
        if (err) throw err;
        fs.close(fd, (err) => {
          if (err) throw err;
        });
      });
    }
  }

  shard(files) {
    const { config } = this.ctx;

    const shardSize = Math.ceil(files.length / shardCount);
    const shardStart = shardSize * shardIndex;
    const shardEnd = shardSize * (shardIndex + 1);

    return Promise.resolve(
      [...files]
        .map((spec) => {
          const fullPath = resolve(
            config.root.replace(/\\/g, "/"),
            spec[1].replace(/\\/g, "/"),
          );
          const specPath = fullPath?.slice(config.root.length);
          return {
            spec,
            hash: createHash("sha1").update(specPath).digest("hex"),
          };
        })
        .sort((a, b) => (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0))
        .slice(shardStart, shardEnd)
        .map(({ spec }) => spec),
    );
  }

  sort(files) {
    return super.sort(files);
  }
}

export default BazelSequencer;
