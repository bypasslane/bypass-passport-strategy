var requestPromise = require('request-promise');

var BypassAuth = function() {}


BypassAuth.login = function(authServer, key) {
  if (!key) {
    throw new Error("Invalid session token");
  }
  var options = {
    uri:  authServer + '/session',
    headers: {
      'X-SESSION-TOKEN': key
    },
    json: true
  }

  // TODO handle 401 throw
  return requestPromise(options);
}

module.exports = BypassAuth;
