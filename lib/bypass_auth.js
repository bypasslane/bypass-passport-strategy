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

BypassAuth.restrictToAdmin = function(req, res, next) {
  if (req.user.account.type != "Admin") {
    return res.sendStatus(401);
  }
  return next();
};

BypassAuth.restrictToVenues = function(req, res, next) {
  if (req.params.venue_id &&
      req.user.account.venue_ids &&
      req.user.account.venue_ids.indexOf(parseInt(req.params.venue_id)) >= 0) {
    next();
  } else {
    return res.sendStatus(401);
  }
};

module.exports = BypassAuth;
