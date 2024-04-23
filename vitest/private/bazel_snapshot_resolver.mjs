import path from "node:path";

const EXTENSION = "snap";
const DOT_EXTENSION = `.${EXTENSION}`;

if (!process.env.VITEST_TEST__UPDATE_SNAPSHOTS) {
  console.error(
    `[rules_vitest]: internal error - ${path.basename(
      import.meta.url,
    )} should only be used for snapshot update.`,
  );
  process.exit(1);
}

if (!process.env.BUILD_WORKSPACE_DIRECTORY) {
  console.error(
    `[rules_vitest]: snapshot update must be 'bazel run', not 'bazel test'.`,
  );
  process.exit(1);
}

// Default snapshot resolver based on
// https://github.com/aspect-build/rules_jest/blob/main/jest/private/bazel_snapshot_resolver.cjs#L29-L33
const defaultResolveSnapshotPath = (testPath) =>
  path.join(
    path.join(path.dirname(testPath), "__snapshots__"),
    path.basename(testPath) + DOT_EXTENSION,
  );

// The root test directory aligning with the workspace source root directory.
// This run of Vitest is meant for generating reference snapshots for the snapshots update Bazel target.

// Switch the directory of snapshots to within the src dir (BUILD_WORKSPACE_DIRECTORY) instead
// of the snapshots dir in bazel-bin.
//
// This means none of the snapshots copied into the bin dir will be used, all will be considered
// snapshot test failures and be written to BUILD_WORKSPACE_DIRECTORY.
export const createSnapshotResolver = (
  origResolveSnapshotPath = defaultResolveSnapshotPath,
) => {
  return (testPath) => {
    let orig = origResolveSnapshotPath(testPath);

    if (path.isAbsolute(orig)) {
      const ROOT = path.join(
        process.env.TEST_SRCDIR,
        process.env.TEST_WORKSPACE,
      );
      orig = path.join(
        process.env.BUILD_WORKSPACE_DIRECTORY,
        path.relative(ROOT, orig),
      );
    }

    return orig;
  };
};
