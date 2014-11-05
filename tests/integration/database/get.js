'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var nano = harness.locals.nano;

it('should be able to fetch the database', function(assert) {
  nano.db.get('database_get', function(error, response) {
    assert.equal(error, null, 'should get the db');
    assert.equal(response['doc_count'], 0, 'should be empty');
    assert.equal(response['db_name'], 'database_get', 'name');
    assert.end();
  });
});
