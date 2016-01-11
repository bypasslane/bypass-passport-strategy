/* global describe, it, expect */

var Strategy = require('../lib/bypass_strategy');

describe('Strategy', function() {

  var strategy = new Strategy(function(){});

  it('should be named bypasstoken', function() {
    expect(strategy.name).toEqual('bypasstoken');
  });

});
