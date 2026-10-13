import { defineConfig } from "vitest/config";

// Coverage combined with an explicit test.root: the covered source lives under
// the root, so include globs must resolve relative to it without a `..` prefix.
export default defineConfig({
  test: {
    environment: "node",
    root: "./src",
  },
});
