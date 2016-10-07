/**
 * Module dependencies.
 */
var Strategy = require('./bypass_strategy');
var JwtStrategy = require('./bypass_jwt_strategy');

/**
 * Expose `Strategy` directly from package.
 */
exports = module.exports = Strategy;
exports = module.exports = JwtStrategy;

/**
 * Export constructors.
 */
exports.Strategy    = Strategy;
exports.JwtStrategy = JwtStrategy;
exports.Auth        = require('./bypass_auth');
