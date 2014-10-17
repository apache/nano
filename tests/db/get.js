'use strict';

var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;

it('should be able to fetch the database', function(assert) {
  var nano = this.nano;
  nano.db.get('db_get', function(error, response) {
    assert.equal(error, null, 'should get the db');
    assert.equal(response['doc_count'], 0, 'should be empty');
    assert.equal(response['db_name'], 'db_get', 'name should be `db_get`');
    assert.end();
  });
});
