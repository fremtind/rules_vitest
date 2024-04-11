import { join, basename, dirname } from "node:path";

const DOT_EXTENSION = `.snap`;

export const resolveSnapshotPath = (testPath) =>
  join(
    join(dirname(testPath), "__my_snapshots__"),
    basename(testPath) + DOT_EXTENSION,
  );
