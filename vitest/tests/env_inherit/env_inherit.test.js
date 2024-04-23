import { test, expect } from "vitest";

test("env_inherit", () => {
  expect(process.env.LANG).toContain(".");
});
