const { test, expect } = await import("vitest");
const { foobar } = require("./case7.index.js");

test("foobar", () => {
  expect(foobar()).toEqual("foobar");
});
