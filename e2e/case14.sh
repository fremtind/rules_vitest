#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Case 14: generate a coverage report when the vitest config sets an explicit
# test.root. The covered source lives under the root, so include globs must
# resolve relative to it (no `..` prefix) and coverage must be produced.
bazel coverage //vitest/tests:case14 --instrument_test_targets

COVERAGE_FILE="bazel-testlogs/vitest/tests/case14/coverage.dat"

if [ ! -f "$COVERAGE_FILE" ]; then
	echo "Missing coverage file $COVERAGE_FILE"
	exit 1
fi

if ! grep -q "SF:vitest/tests/case14/src/case14.index.js" "$COVERAGE_FILE"; then
	echo "Coverage file does not contain coverage for covered function"
	exit 1
fi
