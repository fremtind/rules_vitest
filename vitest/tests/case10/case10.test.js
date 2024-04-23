import { test, expect } from "vitest";

test("the config + setup files run", () => {
  expect(TEST_SETUP_VALUE).toEqual(42);
  expect(TEST_SETUP_VALUE).toMatchSnapshot();

  expect(TEST_SETUP_IMPORT_VALUE).toEqual("function");
  expect(TEST_SETUP_IMPORT_VALUE).toMatchSnapshot();
});
