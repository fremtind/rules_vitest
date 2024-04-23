import * as path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: [
      path.join(path.dirname(import.meta.url), "case10.setup.js"),
      path.join(path.dirname(import.meta.url), "case10.setup-import.js"),
    ],
  },
});
