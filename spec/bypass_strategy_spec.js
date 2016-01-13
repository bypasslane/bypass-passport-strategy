/* global describe, it, expect */
var mockery = require("mockery");
var fs = require('fs');

mockery.registerMock('./bypass_auth.js', {
  login: function(server, key) {
    if (key == "fail") {
      return Promise.reject({statusCode: 401});
    } else if (key == "error") {
      return Promise.reject({statusCode: 500});
    } else {
      var response = JSON.parse(fs.readFileSync(__dirname + '/fixtures/auth.json'));
      return Promise.resolve(response);
    }
  }
});

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false,
  useCleanCache: true
});

var BypassStrategy = require('../lib/bypass_strategy');

describe('BypassStrategy', function() {

  it('requires a server', function() {
    expect(function() {
      new BypassStrategy()
    }).toThrow();
  });

  describe('with proper params', function() {
    var strategy;

    beforeAll(function() {
      strategy = new BypassStrategy({server: 'http://authme.com'});
      strategy.fail = function() {}
      strategy.success = function() {}
      strategy.error = function() {}
    });

    afterAll(function() {
      mockery.disable();
    });

    it('should be named bypasstoken', function() {
      expect(strategy.name).toEqual('bypasstoken');
    });

    describe('authenticating', function() {
      var request;

      beforeEach(function() {
        request = {
          headers: {
            'x-session-token': "valid"
          }
        }
      });

      it('calls fail if no token is present', function(done) {
        spyOn(strategy, 'fail').and.callFake(function(msg) {
          expect(strategy.fail).toHaveBeenCalledWith("No token found");
          done();
        });
        strategy.authenticate({headers: {}});
      });

      it('calls fail() with Unauthorized if it receives a 401', function(done) {
        spyOn(strategy, 'fail').and.callFake(function(msg) {
          expect(strategy.fail).toHaveBeenCalledWith("Unauthorized");
          done();
        });
        request.headers['x-session-token'] = 'fail';
        strategy.authenticate(request, {});
      });

      it('calls success() with the user if it receives a 200', function(done) {
        spyOn(strategy, 'success').and.callFake(function() {
          expect(strategy.success).toHaveBeenCalled();
          done();
        });
        strategy.authenticate(request);
      });

      it('calls error() with the error if it receives a 500', function(done) {
        spyOn(strategy, 'error').and.callFake(function() {
          expect(strategy.error).toHaveBeenCalled();
          done();
        });
        request.headers['x-session-token'] = 'error';
        strategy.authenticate(request);
      });

    });
  });
});
