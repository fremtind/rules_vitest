class BazelSnapshotReporter {
  onFinished(files) {
    // Exit early when running outside snapshot update mode.
    if (!process.env.VITEST_TEST__UPDATE_SNAPSHOTS) {
      return;
    }
    let hasErrors = false;
    for (const file of files) {
      console.error(file);
      if (file.result && file.result.state === "fail") {
        hasErrors = true;
      }
    }
    if (hasErrors) {
      console.log(`
================================================================================
      
Update snapshots by running,

  bazel run ${process.env["TEST_TARGET"].replace(/_bin$/, "")}_update_snapshots

================================================================================
`);
    }
  }
}

module.exports = BazelSnapshotReporter;
