const { test, expect } = await import("vitest");
const index = require(".");

test("it should work", () => {
  expect(index).toBe("test");
});
