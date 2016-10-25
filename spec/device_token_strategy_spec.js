/* global describe, it, expect */
var mock = require('./support/mock');
var fs = require('fs');


// Pretty much identical to BypassStrategy, just looks at a different header value
describe('DeviceTokenStrategy', function() {
  var DeviceTokenStrategy;
  beforeEach(function() {

    mock({
      './bypass_auth.js': {
        login: function(server, key) {
          if (key == "fail") {
            return Promise.reject({statusCode: 401});
          } else if (key == "error") {
            return Promise.reject({statusCode: 500});
          } else if (key == "no-user") {
            return Promise.resolve(null);
          } else {
            var response = JSON.parse(fs.readFileSync(__dirname + '/fixtures/auth.json'));
            return Promise.resolve(response);
          }
        }
      }}, function () {
      DeviceTokenStrategy = require('../lib/device_token_strategy');
    });


    //BypassAuth = require("../lib/bypass_auth.js");
  });

  it('requires a server', function() {
    expect(function() {
      new DeviceTokenStrategy();
    }).toThrow();
  });

  describe('with proper params', function() {
    var strategy;

    beforeAll(function() {
      strategy = new DeviceTokenStrategy({server: 'http://authme.com'});
      strategy.fail = function() {};
      strategy.success = function() {};
      strategy.error = function() {};
    });

    it('should be named bypasstoken', function() {
      expect(strategy.name).toEqual('devicetoken');
    });

    describe('authenticating', function() {
      var request;

      beforeEach(function() {
        request = {
          headers: {
            'x-device-token': "valid"
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
        request.headers['x-device-token'] = 'fail';
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
        request.headers['x-device-token'] = 'error';
        strategy.authenticate(request);
      });

      it('fails if the response does not return a user', function () {
        spyOn(strategy, 'error').and.callFake(function() {
          expect(strategy.fail).toHaveBeenCalled();
          done();
        });
        request.headers['x-device-token'] = 'no-user';
        strategy.authenticate(request);
      });

    });
  });

});
