'use strict';

var helpers = require('../../helpers/unit');
var test  = require('tape');
var debug = require('debug')('nano/tests/unit/shared/jar');

var cli = helpers.mockClientJar(debug);

test('it should be able to set a jar box', function(assert) {
  assert.equal(cli.config.jar, 'is set');
  cli.relax({}, function(_, req) {
    assert.equal(req.jar, 'is set');
    cli.relax({jar: 'changed'}, function(_, req) {
      assert.equal(req.jar, 'changed');
      assert.end();
    });
  });
});
