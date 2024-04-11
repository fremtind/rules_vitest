const { test, expect } = await import("vitest");
const index = require(".");

test("this will end up in the second shard", () => {
  expect(1).toBe(1);
});
