import { test, expect } from "vitest";

test("explicit relative test.root is honored", () => {
  expect(globalThis.__CASE13_ROOT__).toBe("src");
});
