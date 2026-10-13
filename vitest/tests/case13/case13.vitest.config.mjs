import { defineConfig } from "vitest/config";

// Explicit relative test.root: must be honored and resolved against this config
// file's directory, so setupFiles below resolves under src/.
export default defineConfig({
  test: {
    environment: "node",
    root: "./src",
    setupFiles: ["./case13.setup.js"],
  },
});
