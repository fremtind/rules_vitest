# Bazel rules for vitest

Runs tests with the https://vitest.dev/ test runner under Bazel.

rules_vitest is forked from [rules_jest](https://github.com/aspect-build/rules_jest) by https://aspect.dev

## Installation

From the release you wish to use:
<https://github.com/fremtind/rules_vitest/releases>
copy the WORKSPACE snippet into your `WORKSPACE` file.

## Usage

Run all Vitest tests in the workspace: `bazel test --test_lang_filters=vitest //...`

See [vitest_test](docs/vitest_test.md) API documentation and the example usages in the [example](https://github.com/aspect-build/rules_vitest/tree/main/example/) folder.

> Note that the example also relies on code in the `/WORKSPACE` file in the root of this repo.

## Troubleshooting and common challenges

⚠️ `vite`, `vitest`, `react (optional)`, `jsdom (optional)` must be installed at root ⚠️
We have not figured out why yet, but it seems to be an issue with [ESM imports under Bazel](https://github.com/aspect-build/rules_js/issues/362)

For troubleshooting and common challenges, see [docs/troubleshooting.md](docs/troubleshooting.md).
