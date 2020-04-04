/**
 * Module dependencies.
 */
const Strategy = require('./bypass_strategy');
const JwtStrategy = require('./device_token_strategy');
const KeyStrategy = require('./key_strategy');

/**
 * Expose `Strategy` directly from package.
 */
exports = module.exports = Strategy;

/**
 * Export constructors.
 */
exports.Strategy    = Strategy;
exports.JwtStrategy = JwtStrategy;
exports.KeyStrategy = KeyStrategy;
exports.Auth        = require('./bypass_auth');
