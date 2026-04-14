// ============================================
// TIMING: Capture the absolute start time FIRST
// ============================================
const PROCESS_START = Date.now();
const PROCESS_START_ISO = new Date().toISOString();

import * as path from "path";
import * as fs from "fs";

const IMPORTS_DONE = Date.now();

// Debug configuration
const DEBUG = !!process.env.JS_BINARY__LOG_DEBUG || !!process.env.VITEST_DEBUG_COVERAGE;

function debugLog(label, ...args) {
  if (DEBUG) {
    const elapsed = Date.now() - PROCESS_START;
    console.error(`DEBUG: [${elapsed}ms] fremtind_rules_vitest[${label}]:`, ...args);
  }
}

function timeStart(label) {
  if (DEBUG) {
    console.time(`[vitest] ${label}`);
  }
}

function timeEnd(label) {
  if (DEBUG) {
    console.timeEnd(`[vitest] ${label}`);
  }
}

debugLog('startup', `Process started at ${PROCESS_START_ISO}`);
debugLog('startup', `Core imports completed in ${IMPORTS_DONE - PROCESS_START}ms`);

const updateSnapshots = !!process.env.VITEST_TEST__UPDATE_SNAPSHOTS;
const coverageEnabled = !!process.env.COVERAGE_DIR;
// Bazel's launcher sets NODE_V8_COVERAGE, causing each fork worker to write
// raw V8 coverage JSON to disk on exit. rules_vitest uses a no-op lcov_merger
// and handles coverage via Vitest itself, so these files are never needed.
// Delete it so fork workers spawned by Vitest don't inherit it.
if (process.env.NODE_V8_COVERAGE) {
  debugLog('coverage', 'Unsetting NODE_V8_COVERAGE to prevent fork workers from writing raw V8 JSON on exit');
  delete process.env.NODE_V8_COVERAGE;
}


const autoConfReporters = !!"{{AUTO_CONF_REPORTERS}}";
const autoConfTestSequencer = !!"{{AUTO_CONF_TEST_SEQUENCER}}";
const coverageProvider = "{{COVERAGE_PROVIDER}}";
const userConfigShortPath = "{{USER_CONFIG_SHORT_PATH}}";
const generatedConfigShortPath = "{{GENERATED_CONFIG_SHORT_PATH}}";

debugLog('config', 'coverageEnabled:', coverageEnabled);
debugLog('config', 'coverageProvider:', coverageProvider);
debugLog('config', 'updateSnapshots:', updateSnapshots);

const runfiles = process.env.RUNFILES || process.env.RUNFILES_DIR;

const projectRoot = path.join(
    runfiles,
    process.env.JS_BINARY__WORKSPACE,
);

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

// ============================================
// USER CONFIG LOADING
// ============================================
let config = {};
if (userConfigShortPath) {
  debugLog('user-config', 'Loading user config from:', userConfigShortPath);
  timeStart('user config import');

  const userConfigModule = (
      await import("file://" + _resolveRunfilesPath(userConfigShortPath))
  ).default;

  timeEnd('user config import');

  if (typeof userConfigModule === "function") {
    debugLog('user-config', 'User config is a function, calling it...');
    timeStart('user config function call');
    config = await userConfigModule({ mode: "test" });
    timeEnd('user config function call');
  } else {
    config = userConfigModule;
  }
  debugLog('user-config', 'User config loaded');
}

if (!config.test) {
  config.test = {};
}
config.test.root = vitestConfigDir;

// ============================================
// SEQUENCER SETUP
// ============================================
if (autoConfTestSequencer) {
  if (config.test.sequence) {
    console.error(`WARNING: [vitest_test]: user supplied Vitest config test.sequence value '${JSON.stringify(
        config.test.sequence,
    )}' will be overridden by vitest_test in target ${process.env.TEST_TARGET}.`);
  }

  debugLog('sequencer', 'Loading bazel sequencer...');
  timeStart('sequencer import');
  config.test.sequence = {
    sequencer: (await import("file://" + bazelSequencerPath)).default,
  };
  timeEnd('sequencer import');
}

// ============================================
// REPORTERS SETUP
// ============================================
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

// ============================================
// SNAPSHOT RESOLVER (for update mode)
// ============================================
if (updateSnapshots) {
  debugLog('snapshot', 'Loading snapshot resolver...');
  timeStart('snapshot resolver import');
  let createSnapshotResolver = (
      await import("file://" + bazelSnapshotResolverPath)
  ).createSnapshotResolver;
  config.test.resolveSnapshotPath = createSnapshotResolver(
      config.test.resolveSnapshotPath,
  );
  timeEnd('snapshot resolver import');
}

// ============================================
// COVERAGE CONFIGURATION - CRITICAL SECTION
// ============================================
if (coverageEnabled) {
  debugLog('coverage', '=== COVERAGE SETUP START ===');
  timeStart('coverage setup TOTAL');

  let coverageFile = path.basename(process.env.COVERAGE_OUTPUT_FILE);
  let coverageDirectory = path.dirname(process.env.COVERAGE_OUTPUT_FILE);

  if (process.env.SPLIT_COVERAGE_POST_PROCESSING == "1") {
    coverageDirectory = process.env.COVERAGE_DIR;
    coverageFile = "coverage.dat";
  }

  debugLog('coverage', 'coverageDirectory:', coverageDirectory);
  debugLog('coverage', 'coverageFile:', coverageFile);
  debugLog('coverage', 'COVERAGE_MANIFEST:', process.env.COVERAGE_MANIFEST);

  config.test.coverage = {
    ...(config.test.coverage || {}),
    enabled: true,
    provider: coverageProvider,
    reportsDirectory: coverageDirectory,
    reporter: ["text", ["lcov", { file: coverageFile, projectRoot }]],
  };

  // Time the manifest file reading
  timeStart('read COVERAGE_MANIFEST file');
  const manifestPath = process.env.COVERAGE_MANIFEST;
  const manifestStats = fs.statSync(manifestPath);
  debugLog('coverage', 'manifest file size:', manifestStats.size, 'bytes');
  const manifestContent = fs.readFileSync(manifestPath).toString("utf8");
  timeEnd('read COVERAGE_MANIFEST file');

  timeStart('process COVERAGE_MANIFEST lines');
  const manifestLines = manifestContent.split("\n").filter((f) => f !== "");
  debugLog('coverage', 'manifest lines count:', manifestLines.length);
  timeEnd('process COVERAGE_MANIFEST lines');

// AFTER (fast): 3-5 directory globs → O(N × 5) minimatch
  timeStart('compute coverage.include paths');
  const specificPaths = manifestLines
      .map((f) => path.relative(vitestConfigDir, path.join(projectRoot, f)));

  const COVERAGE_EXTENSIONS = '{ts,tsx,js,jsx,mjs,cjs,cts,mts}';
  const topLevelDirs = new Set();
  const rootLevelFiles = [];
  for (const relPath of specificPaths) {
    const slashIdx = relPath.indexOf('/');
    if (slashIdx === -1 || relPath.startsWith('../')) {
      // Can't generalize; keep specific path
      rootLevelFiles.push(relPath);
    } else {
      topLevelDirs.add(relPath.substring(0, slashIdx));
    }
  }
  config.test.coverage.include = [
    ...[...topLevelDirs].map(dir => `${dir}/**/*.${COVERAGE_EXTENSIONS}`),
    ...rootLevelFiles,
  ];

  timeEnd('compute coverage.include paths');

  debugLog('coverage', 'coverage.include count:', config.test.coverage.include.length);

  if (config.test.coverage.include.length > 0) {
    debugLog('coverage', 'First 5 include patterns:', config.test.coverage.include.slice(0, 5));
    debugLog('coverage', 'Last 5 include patterns:', config.test.coverage.include.slice(-5));
  }

  timeEnd('coverage setup TOTAL');
  debugLog('coverage', '=== COVERAGE SETUP END ===');
}

// ============================================
// FINAL CONFIG OUTPUT
// ============================================
const CONFIG_DONE = Date.now();
debugLog('summary', `Config setup completed in ${CONFIG_DONE - PROCESS_START}ms`);

if (DEBUG) {
  console.error(
      "DEBUG: fremtind_rules_vitest[config-dump]:",
      JSON.stringify(config, null, 2),
  );
}

// ============================================
// HOOK INTO VITEST LIFECYCLE FOR MORE TIMING
// ============================================
if (DEBUG) {
  // Add a plugin to track Vitest's internal phases
  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push({
    name: 'vitest-debug-timing',

    configResolved(resolvedConfig) {
      debugLog('vitest-lifecycle', `configResolved at ${Date.now() - PROCESS_START}ms`);
    },

    // Vite hooks
    buildStart() {
      debugLog('vitest-lifecycle', `buildStart at ${Date.now() - PROCESS_START}ms`);
    },

    buildEnd() {
      debugLog('vitest-lifecycle', `buildEnd at ${Date.now() - PROCESS_START}ms`);
    },

    // Transform hook - this fires for EVERY file being instrumented!
    transform(code, id) {
      // Only log occasionally to avoid spam
      if (!this._transformCount) this._transformCount = 0;
      this._transformCount++;

      if (this._transformCount === 1) {
        debugLog('vitest-transform', `First transform at ${Date.now() - PROCESS_START}ms: ${id}`);
      }
      if (this._transformCount % 100 === 0) {
        debugLog('vitest-transform', `Transformed ${this._transformCount} files at ${Date.now() - PROCESS_START}ms`);
      }

      return null; // Don't modify code
    },
  });

  // Track when tests actually start/end
  if (!config.test.reporters) {
    config.test.reporters = [];
  }

  // Add inline reporter for lifecycle tracking
  config.test.reporters.push({
    onInit(ctx) {
      debugLog('vitest-reporter', `onInit at ${Date.now() - PROCESS_START}ms`);
    },
    onPathsCollected(paths) {
      debugLog('vitest-reporter', `onPathsCollected at ${Date.now() - PROCESS_START}ms, paths: ${paths?.length || 0}`);
    },
    onCollected(files) {
      debugLog('vitest-reporter', `onCollected at ${Date.now() - PROCESS_START}ms, files: ${files?.length || 0}`);
    },
    onFinished(files, errors) {
      debugLog('vitest-reporter', `onFinished at ${Date.now() - PROCESS_START}ms`);
      debugLog('vitest-reporter', `Total process time: ${Date.now() - PROCESS_START}ms`);
    },
    onTaskUpdate(packs) {
      // Log first and every 10th task
      if (!this._taskCount) this._taskCount = 0;
      this._taskCount++;
      if (this._taskCount === 1 || this._taskCount % 10 === 0) {
        debugLog('vitest-reporter', `onTaskUpdate #${this._taskCount} at ${Date.now() - PROCESS_START}ms`);
      }
    },
  });
}

export default config;
