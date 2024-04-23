import * as starService from "./service.js";
import { exportedMethod } from "./service.js";
const requireService = require("./service.js");

vi.spyOn(starService, "exportedMethod").mockReturnValue("mock service");

test("star import", () => {
  expect(starService.exportedMethod()).toBe("mock service");
});

test("direct import", () => {
  expect(exportedMethod()).toBe("mock service");
});

test("dynamic import()", async () => {
  expect((await import("./service.js")).exportedMethod()).toBe("mock service");
});

test("require", () => {
  expect(requireService.exportedMethod()).toBe("mock service");
});

test("inline require", () => {
  expect(require("./service.js").exportedMethod()).toBe("mock service");
});
