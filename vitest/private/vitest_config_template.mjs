import * as path from "path";
import * as fs from "fs";

const updateSnapshots = !!process.env.VITEST_TEST__UPDATE_SNAPSHOTS;
const coverageEnabled = !!process.env.COVERAGE_DIR;
const autoConfReporters = !!"{{AUTO_CONF_REPORTERS}}";
const autoConfTestSequencer = !!"{{AUTO_CONF_TEST_SEQUENCER}}";
const userConfigShortPath = "{{USER_CONFIG_SHORT_PATH}}";
const generatedConfigShortPath = "{{GENERATED_CONFIG_SHORT_PATH}}";

const projectRoot = path.join(
  process.env.RUNFILES_DIR,
  process.env.JS_BINARY__WORKSPACE,
);


// Glob pattern paths for which files to cover must be relative to this
// vitest config file in runfiles.
const vitestConfigDir = path.dirname(
  _resolveRunfilesPath(generatedConfigShortPath),
);

function _resolveRunfilesPath(rootpath) {
  return path.join(projectRoot, rootpath);
}

const bazelSequencerPath = _resolveRunfilesPath(
  "{{BAZEL_SEQUENCER_SHORT_PATH}}",
);
const bazelSnapshotReporterPath = _resolveRunfilesPath(
  "{{BAZEL_SNAPSHOT_REPORTER_SHORT_PATH}}",
);
const bazelSnapshotResolverPath = _resolveRunfilesPath(
  "{{BAZEL_SNAPSHOT_RESOLVER_SHORT_PATH}}",
);

function _addReporter(config, reporter, outputFile) {
  if (!config.test.reporters) {
    config.test.reporters = [];
  }
  config.test.reporters.push(reporter);
  if (outputFile) {
    if (!config.test.outputFile) {
      config.test.outputFile = {};
    }
    config.test.outputFile[reporter] = outputFile;
  }
}

let config = {};
if (userConfigShortPath) {
  // On Windows, import does not like paths that start with the drive letter such as
  // `c:\...` so we prepend the with `file://` so node is happy.
  const userConfigModule = (
    await import("file://" + _resolveRunfilesPath(userConfigShortPath))
  ).default;
  if (typeof userConfigModule === "function") {
    config = await userConfigModule({ mode: "test" });
  } else {
    config = userConfigModule;
  }
}

if (!config.test) {
  config.test = {};
}
config.test.root = vitestConfigDir;

if (autoConfTestSequencer) {
  if (config.test.sequence) {
    console.error(`WARNING: [vitest_test]: user supplied Vitest config test.sequence value '${JSON.stringify(
      config.test.sequence,
    )}' will be overridden by vitest_test in target ${process.env.TEST_TARGET}.
    See https://vitest.dev/config/#sequence-sequencer for more information on Vitest test.sequence config option.`);
  }

  config.test.sequence = {
    sequencer: (await import("file://" + bazelSequencerPath)).default,
  };
}

if (autoConfReporters) {
  config.test.reporters = [];
  _addReporter(config, "default");

  if (!updateSnapshots) {
    _addReporter(config, "junit", process.env.XML_OUTPUT_FILE);
  }
}

if (!updateSnapshots) {
  _addReporter(config, bazelSnapshotReporterPath);
}

// If this is an update snapshot target the configure the Bazel snapshot resolver
if (updateSnapshots) {
  let createSnapshotResolver = (
    await import("file://" + bazelSnapshotResolverPath)
  ).createSnapshotResolver;
  config.test.resolveSnapshotPath = createSnapshotResolver(
    config.test.resolveSnapshotPath,
  );
}

if (coverageEnabled) {
  let coverageFile = path.basename(process.env.COVERAGE_OUTPUT_FILE);
  let coverageDirectory = path.dirname(process.env.COVERAGE_OUTPUT_FILE);

  if (process.env.SPLIT_COVERAGE_POST_PROCESSING == "1") {
    // in split coverage post processing mode bazel assumes that the COVERAGE_OUTPUT_FILE
    // will be created by lcov_merger which runs as a separate action with everything in
    // COVERAGE_DIR provided as inputs. so we'll just create the final coverage at
    // `COVERAGE_DIR/coverage.dat` which then later moved by merger.sh to final location.
    coverageDirectory = process.env.COVERAGE_DIR;
    coverageFile = "coverage.dat";
  }

  config.test.coverage = {
    ...(config.test.coverage || {}),
    enabled: true,
    provider: "istanbul",
    reportsDirectory: coverageDirectory,
    reporter: ["text", ["lcov", { file: coverageFile, projectRoot }]],
  };

  // Only generate coverage for files declared in the COVERAGE_MANIFEST
  config.test.coverage.include = fs
    .readFileSync(process.env.COVERAGE_MANIFEST)
    .toString("utf8")
    .split("\n")
    .filter((f) => f !== "")
    .map((f) => path.relative(vitestConfigDir, path.join(projectRoot, f)));
}

if (process.env.JS_BINARY__LOG_DEBUG) {
  console.error(
    "DEBUG: fremtind_rules_vitest[vitest_test]: config:",
    JSON.stringify(config, null, 2),
  );
}

export default config;
