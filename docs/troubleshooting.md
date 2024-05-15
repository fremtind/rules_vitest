# Common troubleshooting tips

## Configuration

`rules_vitest` configures Vitest to work optimally with Bazel and [`rules_js`](https://github.com/aspect-build/rules_js). Custom configuration may conflict with the default `rules_vitest` configurations and care should be taken when configuring Vitest.

### Resolving modules from vite and vitest

`vite`, `vitest`, `react (optional)`, `jsdom (optional)` must be installed from the same `package.json` file
It seems to be related to [ESM imports under Bazel](https://github.com/aspect-build/rules_js/issues/362)

The [local_install](../example/local_install) example shows that it works when all dependencies are installed from the same `package.json` file, even in a subdirectory

## `rules_js` virtual store

Similar to pnpm, [`rules_js`](https://github.com/aspect-build/rules_js) uses a virtual store for npm packages. This can cause issues with Vitest and may require package hoisting similar to pnpm. See the pnpm [public hoist pattern](https://pnpm.io/npmrc#public-hoist-pattern) documentation for details and [rules_js public_hoist_packages](https://docs.aspect.build/rules/aspect_rules_js/docs/npm_translate_lock#public_hoist_packages) for configuring `rules_js` package hoisting.

## Performance

Vitest is designed to run as a standalone long running application, often having a slow startup time then running incrementally using caching for performance. This conflicts with Bazel which designed for short-lived processes that can be run in parallel and cached.

Common performance issues include:

### Concurrency - Bazel sharding and Vitest concurrency

Vitest runs tests concurrently using workers. This conflicts with Bazel which also runs tests and actions in parallel. Vitest concurrency will be configured by `rules_vitest` to work optimally with Bazel actions and Bazel test sharding.

## Readonly CommonJS `exports`

When ESM modules are transpiled to CommonJS different transpilers may produce different variants of CommonJS.

For example [SWC](https://swc.rs/) (normally used in bazel with [rules_swc](https://github.com/aspect-build/rules_swc)) transpiles ESM imports to align with ESM standards as closely as possible at runtime, even when transpiled to CommonJS. This leads to the same [Module mocking with ESM](https://vitestjs.io/docs/ecmascript-modules#module-mocking-in-esm) issue as native ESM modules.

See the [SWC test](e2e/swc/README.md) for examples and more information.

Other transpilers such as `babel` or `tsc` may have similar issues or configuration to workaround such issues.
