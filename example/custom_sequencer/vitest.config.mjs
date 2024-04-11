import { defineConfig } from "vitest/config";
import BazelSequencer from "./sequencer.mjs";

export default defineConfig({
  test: {
    environment: "node",
    reporters: ["default"],
    sequence: {
      sequencer: BazelSequencer,
    },
  },
});
