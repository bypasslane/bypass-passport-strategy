var requestPromise = require('request-promise');

var BypassAuth = function() {}


BypassAuth.login = function(key) {
  if (!key) {
    throw new Error("Invalid session token");
  }
  var options = {
    uri: 'http://localhost:3005/session',
    headers: {
      'X-SESSION-TOKEN': key
    },
    json: true
  }
  return requestPromise(options);
}

module.exports = BypassAuth;
