var passport = require('passport-strategy')
var util = require('util');
var BypassAuth = require('./bypass_auth.js');

/**
 * `BypassJwtStrategy` constructor.
 *
 * The bypass authentication strategy authenticates requests based on the
 * session token submitted in the Bypass custom headers.
 *
 * Unlike most Passport strategies, this does not require a verify method,
 * as we automatically conform the the Bypass session token strategy.
 *
 * Examples:
 *
 *     passport.use(new BypassJwtStrategy());
 *
 * @api public
 */

function BypassJwtStrategy(options) {
  if (!options || !options.server) {
    throw new Error("A server is required");
  }

  passport.Strategy.call(this);
  this.options = options;
  this.BYPASS_JWT_HEADER = "x-bypass-jwt";
  this.name = 'bypassjwt';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(BypassJwtStrategy, passport.Strategy);

/**
 * Authenticate request.
 *
 *
 * @param {Object} req The request to authenticate.
 * @param {Object} [options] Strategy-specific options.
 * @api public
 */
BypassJwtStrategy.prototype.authenticate = function(req) {
  var key;
  if (req.headers[this.BYPASS_JWT_HEADER]) {
    key = req.headers[this.BYPASS_JWT_HEADER];
  } else {
    return this.fail("No token found");
  }

  var self = this;

  BypassAuth
    .login(this.options.server, key)
    .then(function(user) {
      if (user) {
        self.success(user);
      } else {
        self.fail("Unauthorized");
      }
    })
    .catch(function(err) {
      if (err && err.statusCode === 401) {
        self.fail("Unauthorized");
      } else {
        self.error(err);
      }
    });
};

/**
 * Expose `Strategy`.
 */
module.exports = BypassJwtStrategy;
