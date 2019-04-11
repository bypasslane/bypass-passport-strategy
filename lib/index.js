/**
 * Module dependencies.
 */
var Strategy = require('./bypass_strategy');

/**
 * Expose `Strategy` directly from package.
 */
exports = module.exports = Strategy;

/**
 * Export constructors.
 */
exports.Strategy    = Strategy;
exports.Auth        = require('./bypass_auth');
