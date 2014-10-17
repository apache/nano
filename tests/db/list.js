'use strict';

var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;

it('should list the correct databases', function(assert) {
  var nano = this.nano;
  nano.db.list(function(error, list) {
    assert.equal(error, null, 'should list databases');
    var filtered = list.filter(function(e) {
      return e === 'db_list' || e === '_replicator' || e === '_users';
    });
    assert.equal(filtered.length, 3, 'should have exactly 3 dbs');
    assert.end();
  });
});
