var httpMocks = require('node-mocks-http');
var CryptoJS = require("crypto-js");
var timekeeper = require('timekeeper');
var APIKeyHelpers = require('../lib/api_key_helpers');
var fs = require('fs');
var nock = require('nock');


describe('APIKeyHelpers', function() {
  timekeeper.freeze(new Date());
  var currentEpoch = parseInt(new Date().getTime()/1000);

  describe("authenticating requests", function () {

    it("authenticates a GET request", function () {
      var canonicalString = ['GET', 'application/json', '1B2M2Y8AsgTpgAmY7PhCfg==', '/menus.json', currentEpoch].join();
      var calculatedSig = CryptoJS.HmacSHA256(canonicalString, 'mysecret').toString(CryptoJS.enc.Base64);

      var request  = httpMocks.createRequest({
        method: 'GET',
        url: '/menus.json',
        headers: {
          'DATE': currentEpoch,
          'Content-Type': 'application/json',
          'signature': calculatedSig
        }
      });

      expect(APIKeyHelpers.authenticRequest(request, 'mysecret')).toEqual(true)
    });

    it("authenticates a POST request", function(){
      var encodedBody = CryptoJS.MD5(JSON.stringify({id: "12345"})).toString(CryptoJS.enc.Base64);
      var canonicalString = ['POST', 'application/json', encodedBody, '/menus.json', currentEpoch].join();
      var calculatedSig = CryptoJS.HmacSHA256(canonicalString, 'mysecret').toString(CryptoJS.enc.Base64);

      var request  = httpMocks.createRequest({
        method: 'POST',
        url: '/menus.json',
        headers: {
          'DATE': currentEpoch,
          'Content-Type': 'application/json',
          'signature': calculatedSig
        },body: {
          id: "12345"
        }
      });

      expect(APIKeyHelpers.authenticRequest(request, 'mysecret')).toEqual(true)
    });

    it("fails if the timestamp is off", function () {
      var encodedBody = CryptoJS.MD5(JSON.stringify({id: "12345"})).toString(CryptoJS.enc.Base64);
      var canonicalString = ['POST', 'application/json', encodedBody, '/menus.json', currentEpoch].join();
      var calculatedSig = CryptoJS.HmacSHA256(canonicalString, 'mysecret').toString(CryptoJS.enc.Base64);

      var time = parseInt(new Date(0).getTime()/1000);
      var request  = httpMocks.createRequest({
        method: 'POST',
        url: '/menus.json',
        headers: {
          'DATE': time,
          'Content-Type': 'application/json',
          'signature': calculatedSig
        },body: {
          id: "12345"
        }
      });

      expect(APIKeyHelpers.authenticRequest(request, 'mysecret')).toEqual(false)
    });

    it("fails if the signature is wrong", function () {
      var request  = httpMocks.createRequest({
        method: 'POST',
        url: '/menus.json',
        headers: {
          'DATE': currentEpoch,
          'Content-Type': 'application/json',
          'signature': 'invalid-sig'
        },body: {
          id: "12345"
        }
      });

      expect(APIKeyHelpers.authenticRequest(request, 'mysecret')).toEqual(false)
    })
  });


  describe("signing requests", function () {
    it("returns the proper headers", function () {
      var body = {id: '12345'};
      var encodedBody = CryptoJS.MD5(JSON.stringify({id: "12345"})).toString(CryptoJS.enc.Base64);
      var canonicalString = ['POST', 'application/json', encodedBody, '/menus.json', currentEpoch].join();
      var calculatedSig = CryptoJS.HmacSHA256(canonicalString, 'mysecret').toString(CryptoJS.enc.Base64);

      var headers = APIKeyHelpers.signedRequestHeaders(body, 'application/json', "/menus.json", 'POST', 'my-key', 'mysecret')

      expect(headers["DATE"]).toEqual(parseInt(new Date().getTime()/1000).toString());
      expect(headers["BYPASS-API-ACCESS-KEY"]).toEqual('my-key');
      expect(headers["Content-Type"]).toEqual('application/json');
      expect(headers["signature"]).toEqual(calculatedSig);
    });

  });

  describe("Getting Secrets for Keys", function () {
    it("should return the secret key", function (done) {


      var scope = nock('https://apikeys.example.com')
        .get('/api_creds/12345')
        .reply(200, JSON.parse(fs.readFileSync(__dirname + '/fixtures/api_creds.json')));

      var promise = APIKeyHelpers.getSecret("https://apikeys.example.com", "12345")
      promise.then(function (body) {
        expect(body).toEqual(JSON.parse(fs.readFileSync(__dirname + '/fixtures/api_creds.json')));
        done();
      })
    });
  })

});
