/**
 * Module dependencies.
 */
var Strategy = require('./bypass_strategy');
var JwtStrategy = require('./device_token_strategy');

/**
 * Expose `Strategy` directly from package.
 */
exports = module.exports = Strategy;

/**
 * Export constructors.
 */
exports.Strategy    = Strategy;
exports.JwtStrategy = JwtStrategy;
exports.Auth        = require('./bypass_auth');
