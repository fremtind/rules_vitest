#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Case 4: run a vitest test in an external repository
bazel test @case4//:case4
