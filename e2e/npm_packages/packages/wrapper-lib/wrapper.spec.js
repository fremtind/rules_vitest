import { id } from "./index";
import { describe, expect, test } from "vitest";

global.globalVitestEnvInit();

describe("lib", () => {
  test("returns the id()", () => expect(id).toBeTruthy());
});
