var passport = require('passport-strategy')
var util = require('util');
var BypassAuth = require('./bypass_auth.js');

/**
 * `DeviceTokenStrategy` constructor.
 *
 * The bypass authentication strategy authenticates requests based on the
 * session token submitted in the Bypass custom headers.
 *
 * Unlike most Passport strategies, this does not require a verify method,
 * as we automatically conform the the Bypass session token strategy.
 *
 * Examples:
 *
 *     passport.use(new DeviceTokenStrategy());
 *
 * @api public
 */

function DeviceTokenStrategy(options) {
  if (!options || !options.server) {
    throw new Error("A server is required");
  }

  passport.Strategy.call(this);
  this.options = options;
  this.DEVICE_TOKEN_HEADER = "x-device-token";
  this.name = 'devicetoken';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(DeviceTokenStrategy, passport.Strategy);

/**
 * Authenticate request.
 *
 *
 * @param {Object} req The request to authenticate.
 * @param {Object} [options] Strategy-specific options.
 * @api public
 */
DeviceTokenStrategy.prototype.authenticate = function(req) {
  var key;
  if (req.headers[this.DEVICE_TOKEN_HEADER]) {
    key = req.headers[this.DEVICE_TOKEN_HEADER];
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
 * Expose `DeviceTokenStrategy`.
 */
module.exports = DeviceTokenStrategy;
