/* global describe, it, expect */

const mock = require('./support/mock');
const fs = require('fs');

describe('BypassStrategy', function() {
  it('requires a server', function() {
    const BypassStrategy = require('../lib/bypass_strategy');
    expect(function() {
      new BypassStrategy()
    }).toThrow();
  });
  
  describe('with proper admin params', function() {
    let strategy;
    let BypassStrategy
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
              let response = JSON.parse(fs.readFileSync(__dirname + '/fixtures/admin_session.json'));
              return Promise.resolve(response);
            }
          }
        }}, function () {
        BypassStrategy = require('../lib/bypass_strategy');
      });
      strategy = new BypassStrategy({server: 'http://authme.com', jwtSecret: 'mySecret'});
      strategy.fail = function() {}
      strategy.success = function() {}
      strategy.error = function() {}
    });
    
    it('should be named bypasstoken', function() {
      expect(strategy.name).toEqual('bypasstoken');
    });

    describe('authenticating', function() {
      let request;

      beforeEach(function() {
        request = {
          headers: {
            'x-session-token': "valid",
            'x-bypass-admin-venue': "1"
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

      it('fails if the response does not return a user', function () {
        spyOn(strategy, 'error').and.callFake(function() {
          expect(strategy.fail).toHaveBeenCalled();
          done();
        });
        request.headers['x-session-token'] = 'no-user';
        strategy.authenticate(request);
      });

      it('calls fail if jwt is not verified', function (done) {
        // generatedJWT that is already expired
        const badJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NTQ4Mzk3MTIsImV4cCI6MTU1NDgzOTczMCwiYXVkIjoiIiwic3ViIjoiIn0.JCMMRHHLRwX8_9qzXQaHg4Rp9u01iWLbyPgYzPly8qE";
        spyOn(strategy, 'fail').and.callFake(function (msg) {
          expect(strategy.fail).toHaveBeenCalledWith("invalid signature");
          done();
        });
        strategy.authenticate({ headers: { authorization: `Bearer ${badJWT}` } });
      });

      it('calls success if jwt is verified', function (done) {
        // generated JWT that expires in the year 3020, signed by secret 'mySecret'
        const goodJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NTQ5MDkyNjUsImV4cCI6MzMxNDMzNTQwNjUsImF1ZCI6IiIsInN1YiI6IiJ9.MywMpAo0J4omk8lrxnKS046Hzmirf3TS9LyYmWwPR8E";
        spyOn(strategy, 'success').and.callFake(function (msg) {
          expect(strategy.success).toHaveBeenCalled();
          done();
        });
        strategy.authenticate({ headers: { authorization: `Bearer ${goodJWT}`} });
      });
      
      it('calls fail() if it uses wrong header', function(done) {
        spyOn(strategy, 'fail').and.callFake(function(msg) {
          expect(strategy.fail).toHaveBeenCalledWith("Unauthorized");
          done();
        });
        request.headers['venue-id'] = '2';
        strategy.authenticate(request);
      });
    });
  });
  
  describe('with proper super admin params', function() {
    let strategy;
    let BypassStrategy
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
              let response = JSON.parse(fs.readFileSync(__dirname + '/fixtures/super_admin_session.json'));
              return Promise.resolve(response);
            }
          }
        }}, function () {
        BypassStrategy = require('../lib/bypass_strategy');
      });
      strategy = new BypassStrategy({server: 'http://authme.com', jwtSecret: 'mySecret'});
      strategy.fail = function() {}
      strategy.success = function() {}
      strategy.error = function() {}
    });
    
    describe('authenticating', function() {
      let request;

      beforeEach(function() {
        request = {
          headers: {
            'x-session-token': "valid",
            "x-bypass-admin-venue":"1"
          }
        }
      });
      
      it('calls success() with the user if it receives a 200', function(done) {
        spyOn(strategy, 'success').and.callFake(function() {
          expect(strategy.success).toHaveBeenCalled();
          done();
        });
        strategy.authenticate(request);
      });
      
      it('fails if the response does not return a user', function () {
        spyOn(strategy, 'error').and.callFake(function() {
          expect(strategy.fail).toHaveBeenCalled();
          done();
        });
        request.headers['x-session-token'] = 'no-user';
        strategy.authenticate(request);
      });
    });
  });
  
  describe('with proper order taker params', function() {
    let strategy;
    let BypassStrategy
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
              let response = JSON.parse(fs.readFileSync(__dirname + '/fixtures/order_taker_session.json'));
              return Promise.resolve(response);
            }
          }
        }}, function () {
        BypassStrategy = require('../lib/bypass_strategy');
      });
      strategy = new BypassStrategy({server: 'http://authme.com', jwtSecret: 'mySecret'});
      strategy.fail = function() {}
      strategy.success = function() {}
      strategy.error = function() {}
    });
    
    describe('authenticating', function() {
      let request;

      beforeEach(function() {
        request = {
          headers: {
            'x-session-token': "valid"
          }
        }
      });
      
      it('calls success() with the user if it receives a 200', function(done) {
        spyOn(strategy, 'success').and.callFake(function() {
          expect(strategy.success).toHaveBeenCalled();
          done();
        });
        strategy.authenticate(request);
      });
      
      it('calls fail() with the user if it uses wrong header', function(done) {
        spyOn(strategy, 'fail').and.callFake(function(msg) {
          expect(strategy.fail).toHaveBeenCalledWith("Unauthorized");
          done();
        });
        request.headers['venue-id'] = '2';
        strategy.authenticate(request);
      });
      
    });
  });
});
