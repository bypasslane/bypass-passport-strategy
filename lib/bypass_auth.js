var requestPromise = require('request-promise');

var BypassAuth = {};

BypassAuth.login = function(authServer, sessionToken) {
  if (!sessionToken) {
    throw new Error("Invalid session token");
  }
  var options = {
    uri:  authServer + '/session',
    headers: {
      'X-SESSION-TOKEN': sessionToken
    },
    json: true
  }

  // TODO handle 401 throw
  return requestPromise(options);
};

BypassAuth.deviceLogin = function(authServer, token) {
  if(!token) {
    throw new Error("Invalid device token");
  }
  var options = {
    uri: authServer + '/session',
    headers: {
      'X-DEVICE-TOKEN': token
    },
    json: true
  }

  return requestPromise(options);
}

BypassAuth.loginWithCredentials = function(authServer, username, password, type) {
  var basicAuth = "Basic " + new Buffer(username + ":" + password).toString('base64');

  var options = {
    method: 'POST',
    uri: authServer + '/auth',
    headers: {
      'Authorization': basicAuth
    },
    body: {
      auth_type: type
    },
    json: true
  }

  return requestPromise(options);
};

BypassAuth.restrictToAdmin = function(req, res, next) {
    if (!req.user || !req.user.account || req.user.account.type !== "Admin") {
      console.error("Must be an admin");
    return res.sendStatus(401);
    }

    next();
};

BypassAuth.restrictToSuperAdmin = function(req, res, next) {
    if (!req.user || !req.user.account || req.user.account.super_admin !== true) {
      console.error("Must be a super admin");
      return res.sendStatus(401);
    }
    next();
};

BypassAuth.restrictToVenuesWithRouteValue = function(routeValue){ return function(req, res, next) {
  try {
    if ((req.params[routeValue] &&
        req.user.account.venue_ids &&
        req.user.account.venue_ids.indexOf(parseInt(req.params[routeValue])) >= 0)
        || req.user.account.super_admin === true
      ) {
      return next();
    } else {
      throw new Error("Venue not allowed for User")
    }
  } catch(exception) {
    return res.sendStatus(401);
  }
}};
BypassAuth.restrictToVenues = BypassAuth.restrictToVenuesWithRouteValue('venue_id');

module.exports = BypassAuth;
