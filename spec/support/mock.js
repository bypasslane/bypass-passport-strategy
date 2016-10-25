var mockery = require("mockery");
// This is the wrapper we use to mock
function mockRequire(mocks, callback) {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  });

  Object.keys(mocks).forEach(function (lib) {
    mockery.registerMock(lib, mocks[lib]);
  });

  try {
    callback(mocks);
  } finally {
    mockery.deregisterAll();
    mockery.disable();
  }
}

module.exports = mockRequire;