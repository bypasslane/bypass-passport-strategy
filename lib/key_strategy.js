const passport = require('passport-strategy');
const JWT = require('jsonwebtoken');
const util = require('util');
function KeyStrategy (options) {
  passport.Strategy.call(this);
  this.name = 'bypass-api-key';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(KeyStrategy, passport.Strategy);

/**
 * Authenticate request.
 *
 *
 * @param {Object} req The request to authenticate.
 * @param {Object} [options] Strategy-specific options.
 * @api public
 */
KeyStrategy.prototype.authenticate = function (req) {
  var key;
  if (req.headers['x-api-key']) {
    key = req.headers['x-api-key'];
  } else {
    return this.fail('No X-API-KEY header');
  }

  const self = this;
  JWT.verify(key, process.env.API_KEY_JWT_SECRET, function (err, decoded) {
    if (err) {
      return self.fail('Invalid X-API-KEY');
    } else {
      return self.success({ venue_id: decoded.v, organization_id: decoded.o, type: decoded.t });
    }
  });
};

/**
 * Expose `Strategy`.
 */
module.exports = KeyStrategy;
