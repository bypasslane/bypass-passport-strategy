const httpMocks = require('node-mocks-http');
const KeyStrategy = require('../lib/key_strategy');
process.env.API_KEY_JWT_SECRET = 'password'

// Pretty much identical to BypassStrategy, just looks at a different header value
describe('KeyStrategy', function() {
  describe('with proper params', function() {
    var strategy;
    var currentEpoch = parseInt(new Date().getTime()/1000);

    beforeAll(function() {
      strategy = new KeyStrategy();
      strategy.fail = function() {}
      strategy.success = function() {}
      strategy.error = function() {}
    });

    it('should be named bypassapikey', function() {
      expect(strategy.name).toEqual('bypass-api-key');
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
            'X-API-KEY': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2IjoxLCJvIjoxfQ.Gvw_CXL6p4C_t5mSYRQD2EDzm0XdjKkV_olTCooqJHM"
          }
        });
      });

      it('calls fail if no key is present', function(done) {
        spyOn(strategy, 'fail').and.callFake(function(msg) {
          expect(strategy.fail).toHaveBeenCalledWith("No X-API-KEY header");
          done();
        });
        strategy.authenticate({headers: {}});
      });

      it('calls success() if it can decode the signature properly', function(done) {
        spyOn(strategy, 'success').and.callFake(function() {
          expect(strategy.success).toHaveBeenCalled();
          done();
        });

        strategy.authenticate(request);
      });
      
    });
  });

});
