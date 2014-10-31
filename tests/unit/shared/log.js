var logger = require('../../../lib/logger');

var helpers = require('../../helpers');
var harness = helpers.harness(__filename, true);
var it = harness.it;

it('should be able to instantiate a log', function (assert) {
  var log = logger({
    log: function (id, msg) {
      assert.equal(typeof id, 'string', 'id is set `' + id + '`');
      assert.equal(msg[0], 'testing 1234');
      assert.end();
    }
  })();
  debugger
  log('testing 1234');
});
