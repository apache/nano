'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var nano = harness.locals.nano;

it('should list the correct databases', function(assert) {
  nano.db.list(function(error, list) {
    assert.equal(error, null, 'should list databases');
    var filtered = list.filter(function(e) {
      return e === 'database_list' || e === '_replicator' || e === '_users';
    });
    assert.equal(filtered.length, 3, 'should have exactly 3 dbs');
    assert.end();
  });
});
