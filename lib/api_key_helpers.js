var CryptoJS = require('crypto-js');
var requestPromise = require('request-promise');

var Helpers = function () {};

// Headers will be
// signature - the SHA256 encoded string
// date   - the date of the request
// API-ACCESS-KEY
Helpers.authenticRequest = function (req, secret) {
  var canonicalData = {};

  var calculatedBody = isEmptyObject(req.body) ? '' : JSON.stringify(req.body);
  canonicalData.calculatedMD5 = md5base64digest(calculatedBody);
  canonicalData.date = req.get('date');
  canonicalData.url = req.originalUrl;
  canonicalData.method = req.method.toUpperCase();
  canonicalData.contentType = req.get('Content-Type');

  if (!signaturesMatch(canonicalData, secret, req.get('signature'))) {
    return false;
  } else if (requestTooOld(canonicalData.date)) {
    return false;
  } else {
    return true;
  }
};

// returns a hash of headers that should be added to the request.
Helpers.signedRequestHeaders = function (body, contentType, url, method, key, secret) {
  var currentEpoch = parseInt(new Date().getTime() / 1000);
  var headers = {};
  var canonicalData = {};

  var parsedBody = isEmptyObject(body) ? '' : JSON.stringify(body);
  canonicalData.calculatedMD5 = md5base64digest(parsedBody);
  canonicalData.date = currentEpoch.toString();
  canonicalData.url = url;
  canonicalData.method = method;
  canonicalData.contentType = contentType;

  headers['BYPASS-API-ACCESS-KEY'] = key;
  headers.DATE = currentEpoch.toString();
  headers.signature = calculateSignature(canonicalData, secret);
  headers['Content-Type'] = contentType;

  return headers;
};

Helpers.getSecret = function (apiKeyServer, accessKey) {
  if (!accessKey) {
    throw new Error('Invalid Access Key');
  }
  var options = {
    uri: apiKeyServer + '/api_creds/' + accessKey,
    json: true
  };

  return requestPromise(options);
};

function md5base64digest (body) {
  return CryptoJS.MD5(body).toString(CryptoJS.enc.Base64);
}

function calculateSignature (canonicalData, secret) {
  var canonicalString = [canonicalData.method, canonicalData.contentType, canonicalData.calculatedMD5, canonicalData.url, canonicalData.date].join();
  var calculatedSig = CryptoJS.HmacSHA256(canonicalString, secret).toString(CryptoJS.enc.Base64);
  return calculatedSig;
}

function signaturesMatch (canonicalData, secret, signature) {
  return calculateSignature(canonicalData, secret) === signature;
}

function isEmptyObject (obj) {
  return !Object.keys(obj).length;
}

// # chech if request time is within the last 15 minutes
function requestTooOld (timestamp) {
  var now = new Date();
  var requestTime = new Date(parseInt(timestamp) * 1000);

  return requestTime < new Date(now.getTime() - 900 * 1000);
}

module.exports = Helpers;
