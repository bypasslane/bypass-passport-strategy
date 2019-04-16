const passport = require('passport-strategy')
const util = require('util');
const JWT = require('jsonwebtoken');
const BypassAuth = require('./bypass_auth.js');

/**
 * `BypassStrategy` constructor.
 *
 * The bypass authentication strategy authenticates requests based on the
 * session token submitted in the Bypass custom headers.
 *
 * Unlike most Passport strategies, this does not require a verify method,
 * as we automatically conform the the Bypass session token strategy.
 *
 * Examples:
 *
 *     passport.use(new BypassStrategy());
 *
 * @api public
 */
function BypassStrategy(options) {
  if (!options || !options.server) {
    throw new Error("A server is required");
  }

  passport.Strategy.call(this);
  this.options = options; // Requires server
  this.BYPASS_SESSION_HEADER = "x-session-token";
  this.name = 'bypasstoken';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(BypassStrategy, passport.Strategy);


/**
 * Authenticate request.
 *
 *
 * @param {Object} req The request to authenticate.
 * @param {Object} [options] Strategy-specific options.
 * @api public
 */
BypassStrategy.prototype.authenticate = function (req) {
  let sessionToken;
  let jwt;
  if (req.headers.authorization && req.headers.authorization.includes('Bearer ') && this.options.jwtSecret) {
    jwt = req.headers.authorization.split(' ')[1];
  } else if (req.headers[this.BYPASS_SESSION_HEADER]) {
    sessionToken = req.headers[this.BYPASS_SESSION_HEADER];
  } else {
    return this.fail("No token found");
  }

  var self = this;

  if (jwt && self.options.jwtSecret) {
    JWT.verify(jwt, self.options.jwtSecret, (err, decoded) => {
      if (err) {
        return self.fail(err.message);
      } else {
        return self.success({ account: decoded });
      }
    });
  } else {
    BypassAuth.login(this.options.server, sessionToken)
      .then((user) => {
        if (user) {
          self.success(user);
        } else {
          self.fail("Unauthorized");
        }
      })
      .catch((err) => {
        if (err && err.statusCode === 401) {
          self.fail("Unauthorized");
        } else {
          self.error(err);
        }
      });
  }
};

/**
 * Expose `Strategy`.
 */
module.exports = BypassStrategy;
