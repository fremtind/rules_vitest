#!/usr/bin/env bash

DEBUG=${JS_BINARY__LOG_DEBUG:-$VITEST_DEBUG_COVERAGE}

if [[ -n "$DEBUG" ]]; then
  echo "DEBUG: [merger.sh] Started at $(date +%s.%N)" >&2
  echo "DEBUG: [merger.sh] SPLIT_COVERAGE_POST_PROCESSING=$SPLIT_COVERAGE_POST_PROCESSING" >&2
  echo "DEBUG: [merger.sh] COVERAGE_DIR=$COVERAGE_DIR" >&2
  echo "DEBUG: [merger.sh] COVERAGE_OUTPUT_FILE=$COVERAGE_OUTPUT_FILE" >&2
fi

if [[ $SPLIT_COVERAGE_POST_PROCESSING == 1 ]]; then
  START=$(date +%s.%N)
  cp "${COVERAGE_DIR}/coverage.dat" "${COVERAGE_OUTPUT_FILE}"
  if [[ -n "$DEBUG" ]]; then
    END=$(date +%s.%N)
    echo "DEBUG: [merger.sh] cp completed in $(echo "$END - $START" | bc)s" >&2
  fi
fi

if [[ -n "$DEBUG" ]]; then
  echo "DEBUG: [merger.sh] Completed at $(date +%s.%N)" >&2
fi

exit 0
