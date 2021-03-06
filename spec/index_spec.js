var index = require("../lib/index");
var bypassStrategy = require('../lib/bypass_strategy');
var auth = require("../lib/bypass_auth");

describe("index", function() {
  it("exports constructors for dependent modules", function() {
    expect(index.Strategy).toEqual(bypassStrategy);
    expect(index.Auth).toEqual(auth);
  });

  it("exports Strategy directly from the package", function() {
    expect(index).toEqual(bypassStrategy);
  });
});
