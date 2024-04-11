import * as path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: [path.join(process.cwd(), "vitest-swc-workaround.js")],
  },
});
