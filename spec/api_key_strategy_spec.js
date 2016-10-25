/* global describe, it, expect */
var fs = require('fs');
var nock = require('nock');
var CryptoJS = require("crypto-js");
var httpMocks = require('node-mocks-http');

var APIKeyStrategy = require('../lib/api_key_strategy');

// Pretty much identical to BypassStrategy, just looks at a different header value
describe('APIKeyStrategy', function() {

  it('requires a server', function() {
    expect(function() {
      new APIKeyStrategy();
    }).toThrow();
  });

  describe('with proper params', function() {
    var strategy;
    var currentEpoch = parseInt(new Date().getTime()/1000);

    beforeAll(function() {
      strategy = new APIKeyStrategy({server: 'https://apikeys.example.com'});
      strategy.fail = function() {}
      strategy.success = function() {}
      strategy.error = function() {}
    });

    it('should be named bypassapikey', function() {
      expect(strategy.name).toEqual('bypassapikey');
    });

    describe('authenticating', function() {
      var request;

      beforeEach(function() {
        request  = httpMocks.createRequest({
          method: 'GET',
          url: '/menus.json',
          headers: {
            'DATE': currentEpoch.toString(),
            'Content-Type': 'application/json',
            'signature': '',
            'BYPASS-API-ACCESS-KEY': "my-key"
          }
        });
      });

      it('calls fail if no key is present', function(done) {
        spyOn(strategy, 'fail').and.callFake(function(msg) {
          expect(strategy.fail).toHaveBeenCalledWith("No API Key found");
          done();
        });
        strategy.authenticate({headers: {}});
      });

      it('calls fail() with Unauthorized if it receives a 404', function(done) {
        var scope = nock('https://apikeys.example.com')
          .get('/api_creds/invalid-key')
          .reply(404, {});

        spyOn(strategy, 'fail').and.callFake(function(msg) {
          expect(strategy.fail).toHaveBeenCalledWith("Unauthorized");
          done();
        });
        request._setHeadersVariable('BYPASS-API-ACCESS-KEY','invalid-key');
        strategy.authenticate(request, {});
      });

      it('calls success() if it can decode the signature properly', function(done) {
        var scope = nock('https://apikeys.example.com')
          .get('/api_creds/my-key')
          .reply(200, JSON.parse(fs.readFileSync(__dirname + '/fixtures/api_creds.json')));

        spyOn(strategy, 'success').and.callFake(function() {
          expect(strategy.success).toHaveBeenCalled();
          done();
        });

        var canonicalString = ['GET', 'application/json', '1B2M2Y8AsgTpgAmY7PhCfg==', '/menus.json', currentEpoch].join();
        var calculatedSig = CryptoJS.HmacSHA256(canonicalString, 'your-secret').toString(CryptoJS.enc.Base64);

        request._setHeadersVariable('signature',calculatedSig);
        strategy.authenticate(request);
      });

    });
  });

});
