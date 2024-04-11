const path = require("path");
module.exports = {
  setupFilesAfterEnv: [path.join(process.cwd(), "vitest-swc-workaround.js")],
};
