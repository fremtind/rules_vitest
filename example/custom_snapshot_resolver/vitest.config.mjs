import { defineConfig } from "vitest/config";
import { resolveSnapshotPath } from "./snapshot_resolver.mjs";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    reporters: ["default"],
    resolveSnapshotPath: resolveSnapshotPath,
  },
});
