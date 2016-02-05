var mockery = require("mockery");
var fs = require('fs');

var BypassAuth;

describe('BypassAuth', function() {
  beforeEach(function() {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    mockery.registerMock('request-promise', function() {
      var response = JSON.parse(fs.readFileSync(__dirname + '/fixtures/auth.json'));
      return Promise.resolve(response);
    });

    BypassAuth = require("../lib/bypass_auth.js");
  });

  afterEach(function() {
    mockery.disable();
  });

  describe(".login", function() {
    it("returns a promise", function() {
      var promise = BypassAuth.login("http://localhost:3005", "sdfgjdsfgfds");
      expect(typeof(promise.then)).toEqual('function');
    });

    it("returns user data if successful", function(done) {

      var promise = BypassAuth.login("http://localhost:3005", "CORRECT");
      promise.then(function(user) {
        expect(user).toEqual({"user": {}});
        done();
      });
    });
  });

  describe(".restrictToAdmin", function() {
    it("calls next if account.type is Admin", function() {
      var spy = jasmine.createSpy();
      BypassAuth.restrictToAdmin({user: {account: {type: "Admin"}}}, {}, spy);
      expect(spy).toHaveBeenCalled();
    });

    it("sends a 401 if not an Admin", function() {
      var spy = jasmine.createSpyObj('res', ['sendStatus']);
      BypassAuth.restrictToAdmin({user: {account: {type: "User"}}}, spy, {});
      expect(spy.sendStatus).toHaveBeenCalledWith(401);
    });
  });

});
