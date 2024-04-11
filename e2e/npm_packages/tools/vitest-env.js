// an import of a third-party package
const { vi } = require("vitest");

// a reference to a linked workspace project
const { id: e2eLibId } = require("@e2e/lib");

global.globalVitestEnvInit = function () {
  vi.useFakeTimers();
  global.foo = e2eLibId();
};
