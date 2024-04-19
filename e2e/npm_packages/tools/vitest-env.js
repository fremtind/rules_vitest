// an import of a third-party package
const { vitest } = require("@vitest/globals");

// a reference to a linked workspace project
const { id: e2eLibId } = require("@e2e/lib");

global.globalVitestEnvInit = function () {
  vitest.useFakeTimers();
  global.foo = e2eLibId();
};
