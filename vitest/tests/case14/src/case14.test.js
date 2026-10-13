const { test, expect } = await import("vitest");
const { covered } = require("./case14.index.js");

test("covered", () => {
  expect(covered()).toEqual("covered");
});
