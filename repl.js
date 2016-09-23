var repl = require('repl');
var BypassAuth = require('./lib/bypass_auth.js');

var replServer = repl.start({
  prompt: "bypass-passport-strategy > ",
});

replServer.context.BypassAuth = BypassAuth;
