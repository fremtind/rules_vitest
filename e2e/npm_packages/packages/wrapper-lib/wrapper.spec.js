import { id } from "./index";

global.globalVitestEnvInit();

describe("lib", () => {
  test("returns the id()", () => expect(id).toBeTruthy());
});
