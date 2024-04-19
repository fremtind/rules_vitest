// an import of a third-party package
import { vitest } from "@vitest/globals";

// a reference to a linked workspace project
import { id as e2eLibId } from "@e2e/lib";

global.globalVitestEnvInit = function () {
  vitest.useFakeTimers();
  global.foo = e2eLibId();
};
