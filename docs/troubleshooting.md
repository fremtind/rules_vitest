# Common troubleshooting tips

## Configuration

`rules_vitest` configures Vitest to work optimally with Bazel and [`rules_js`](https://github.com/aspect-build/rules_js). Custom configuration may conflict with the default `rules_vitest` configurations and care should be taken when configuring Vitest.

## `rules_js` virtual store

Similar to pnpm, [`rules_js`](https://github.com/aspect-build/rules_js) uses a virtual store for npm packages. This can cause issues with Vitest and may require package hoisting similar to pnpm. See the pnpm [public hoist pattern](https://pnpm.io/npmrc#public-hoist-pattern) documentation for details and [rules_js public_hoist_packages](https://docs.aspect.build/rules/aspect_rules_js/docs/npm_translate_lock#public_hoist_packages) for configuring `rules_js` package hoisting.

## Performance

Vitest is designed to run as a standalone long running application, often having a slow startup time then running incrementally using caching for performance. This conflicts with Bazel which designed for short-lived processes that can be run in parallel and cached.

Common performance issues include:

### `transformIgnorePatterns`

By default Vitest ignores and does not transform `node_modules/*`. This is often overridden to [transform a subset of modules](https://vitestjs.io/docs/configuration#transformignorepatterns-arraystring). When using rules_js or pnpm the ignore pattern must match the package within the virtual store. See the [`transformIgnorePatterns` notes for pnpm](https://vitestjs.io/docs/configuration#transformignorepatterns-arraystring). If this is misconfigured to not properly ignore `node_modules/*` it may cause significant performance issues.

Example configuration of `transformIgnorePatterns` with `rules_vitest`:

```javascript
const config = {
  transformIgnorePatterns: [
    "<rootDir>/node_modules/.aspect_rules_js/(?!(package-a|@scope\\+pkg-b)@)",
    /* or using relative pattern to match the second 'node_modules/' in 'node_modules/.aspect_rules_js/@scope+pkg-b@x.x.x/node_modules/@scope/pkg-b/' */
    "node_modules/(?!.aspect_rules_js|package-a|@scope/pkg-b)",
  ],
};
```

Note the `.aspect_rules_js` directory, and use of `\\+` for scoped packages.

### Concurrency - Bazel sharding and Vitest concurrency

Vitest runs tests concurrently using workers. This conflicts with Bazel which also runs tests and actions in parallel. Vitest concurrency will be configured by `rules_vitest` to work optimally with Bazel actions and Bazel test sharding.

### `ts-vitest`

`ts-vitest` is often used to write and run Vitest tests using TypeScript. With short-lived Bazel actions compiling TypeScript on each invocation can cause performance issues. Using [`rules_ts`](https://github.com/aspect-build/rules_ts) is recommended to run and cache the TypeScript compilation, removing the need for `ts-vitest` and runtime compilation.

### Vitest `haste`

By default Vitest uses `vitest-haste-map` to optimize and cache fs operations which must be configured to work with Bazel. `rules_vitest` will automatically configure `haste` for compatibility with`rules_vitest` and `rules_js`. Care must be taken with custom Vitest configurations when configuring `haste`.

## Pre-transpiled sources

Frequently outside the Bazel ecosystem sources such as `*.ts` are transpiled on the fly using tools such as `ts-vitest` or `babel-vitest`. Such tools are designed for Vitest and transpile to a javascript format ideal for Vitest but normally not for production use.

Transpiling in bazel is normally done ahead of time to take advantage of bazel caching, ensure that the build is hermetic, ensure the tested code is the same as production code etc. However this transpiling is no longer designed specifically for Vitest like `ts-vitest` or `babel-vitest` which may lead to certain limitations. For example:

### Runtime tsconfig dependency

If a plugin such as `ts-vitest` or `ts-node` is replaced with `rules_ts` (to pre-compile ts files instead of runtime compilation), features such as runtime `tsconfig` path mapping must be replaced with other tools such as `tsconfig-paths`.

### ESM Modules

Normally Vitest uses CommonJS modules (such as when `ts-vitest` or `babel-vitest` does transpiling on the fly), but with bazel the transpiled sources are normally pre-transpiled and remain as native ESM modules for optimal use by bundlers and other tools.

ESM modules come with certain challenges in NodeJS and therefor also in Vitest, see:

- NodeJS support for ESM modules: https://nodejs.org/api/esm.html
- Module mocking with ESM: https://vitestjs.io/docs/ecmascript-modules#module-mocking-in-esm

See https://vitestjs.io/docs/ecmascript-modules for the full Vitest documentation on ESM modules.

### Readonly CommonJS `exports`

When ESM modules are transpiled to CommonJS different transpilers may produce different variants of CommonJS.

For example [SWC](https://swc.rs/) (normally used in bazel with [rules_swc](https://github.com/aspect-build/rules_swc)) transpiles ESM imports to align with ESM standards as closely as possible at runtime, even when transpiled to CommonJS. This leads to the same [Module mocking with ESM](https://vitestjs.io/docs/ecmascript-modules#module-mocking-in-esm) issue as native ESM modules.

See the [SWC test](e2e/swc/README.md) for examples and more information.

Other transpilers such as `babel` or `tsc` may have similar issues or configuration to workaround such issues.
