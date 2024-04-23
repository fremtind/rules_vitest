#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Case 7: generate a coverage report, no supplied vitest config file
bazel coverage //vitest/tests:case7 --instrument_test_targets

COVERAGE_FILE="bazel-testlogs/vitest/tests/case7/coverage.dat"

if [ ! -f "$COVERAGE_FILE" ]; then
	echo "Missing coverage file $COVERAGE_FILE"
	exit 1
fi

if ! grep -q "foobar" "$COVERAGE_FILE"; then
	echo "Coverage file does not contain coverage for foobar function"
	exit 1
fi
