'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var Nano = helpers.Nano;
var it = harness.it;

it('should have a version and a path', function(assert) {
  assert.ok(Nano.version, 'version is defined');
  assert.ok(Nano.path, 'path is defined');
  assert.end();
});
