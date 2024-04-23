import { defineConfig } from "vitest/config";

export default defineConfig(async () => ({
  test: {
    environment: "node",
  },
}));
