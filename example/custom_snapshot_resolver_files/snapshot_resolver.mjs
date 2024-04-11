import { join, basename, dirname } from "node:path";

const DOT_EXTENSION = `.snap`;

export const resolveSnapshotPath = (testPath) =>
  join(dirname(testPath), basename(testPath) + DOT_EXTENSION);
