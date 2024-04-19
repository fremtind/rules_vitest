// an import of a third-party package
import { vi } from "vitest";

// a reference to a linked workspace project
import { id as e2eLibId } from "@e2e/lib";

global.globalVitestEnvInit = function () {
  vi.useFakeTimers();
  global.foo = e2eLibId();
};
