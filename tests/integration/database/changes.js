'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var db = harness.locals.db;
var it = harness.it;

it('should be able to insert three documents', helpers.insertThree);

it('should be able to receive changes since seq:2', function(assert) {
  db.changes({since:2}, function(error, response) {
    assert.equal(error, null, 'gets response from changes');
    assert.equal(response.results.length, 1, 'gets one result');
    assert.equal(response['last_seq'], 3, 'seq is 3');
    assert.end();
  });
});
