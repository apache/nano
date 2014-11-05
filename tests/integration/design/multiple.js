'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

it('should be able to insert docs and design doc', function(assert) {
  db.insert({
    views: {
      'by_id': {
        map: 'function(doc) { emit(doc._id, doc); }'
      }
    }
  }, '_design/alice', function(error, response) {
    assert.equal(error, null, 'should create views');
    assert.equal(response.ok, true, 'response ok');
    assert.end();
  });
});

it('should insert a bunch of items', helpers.insertThree);

it('get multiple docs with a composed key', function(assert) {
  db.view('alice', 'by_id', {
    keys: ['foobar', 'barfoo'],
    'include_docs': true
  }, function(err, view) {
    assert.equal(err, null, 'should response');
    assert.equal(view.rows.length, 2, 'has more or less than two rows');
    assert.equal(view.rows[0].id, 'foobar', 'foo is not the first id');
    assert.equal(view.rows[1].id, 'barfoo', 'bar is not the second id');
    assert.end();
  });
});
