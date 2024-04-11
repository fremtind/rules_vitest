const path = require("path");
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: [path.join(process.cwd(), "tools/vitest-env.mjs")],
  },
});
