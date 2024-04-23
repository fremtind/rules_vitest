// A config-time npm dep and config-time value to verify
globalThis.TEST_SETUP_IMPORT_VALUE = typeof (await import("@aspect-test/c"))
  .default.id;
