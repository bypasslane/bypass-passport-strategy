var sdk = require('./api_key_helpers');
var passport = require('passport-strategy');
var util = require('util');

/**
 * `APIKeyStrategy` constructor.
 *
 * The bypass authentication strategy authenticates requests based on the
 * api key, and signature submitted in request headers.
 *
 *
 * Examples:
 *
 *     passport.use(new APIKeyStrategy());
 *
 * @api public
 */
function APIKeyStrategy(options) {
  if (!options || !options.server) {
    throw new Error("A server is required");
  }

  passport.Strategy.call(this);
  this.options = options; // Requires server
  this.API_KEY_ID_HEADER = "bypass-api-access-key";
  this.name = 'bypassapikey';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(APIKeyStrategy, passport.Strategy);


/**
 * Authenticate request.
 *
 *
 * @param {Object} req The request to authenticate.
 * @param {Object} [options] Strategy-specific options.
 * @api public
 */
APIKeyStrategy.prototype.authenticate = function(req) {
  var key;
  if (req.headers[this.API_KEY_ID_HEADER]) {
    key = req.headers[this.API_KEY_ID_HEADER];
  } else {
    return this.fail("No API Key found");
  }

  var self = this;
  sdk.getSecret(this.options.server, key).then(function (response) {
    if (response){
      if (sdk.authenticRequest(req, response.secret)) {
        self.success(response);
      } else {
        self.fail("Invalid Request");
      }
    } else {
      self.fail("Unauthorized");
    }
  }).catch(function (err) {
    if (err && err.statusCode === 404) {
      self.fail("Unauthorized");
    } else {
      self.error(err);
    }
  });

};

/**
 * Expose `Strategy`.
 */
module.exports = APIKeyStrategy;
