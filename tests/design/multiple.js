'use strict';

var async = require('async');
var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;

it('should be able to insert docs and design doc', function(assert) {
  var db = this.db;
  db.insert({
    views: {
      'by_id': {
        map: 'function(doc) { emit(doc._id, doc); }'
      }
    }
  }, '_design/alice', function(error, response) {
    assert.equal(error, null, 'should create views');
    assert.equal(response.ok, true, 'response ok');
    async.parallel([
      function(cb) { db.insert({'foo': 'bar'}, 'foobar', cb); },
      function(cb) { db.insert({'bar': 'foo'}, 'barfoo', cb); },
      function(cb) { db.insert({'foo': 'baz'}, 'foobaz', cb); }
    ], function(error) {
      assert.equal(error, undefined, 'stores docs');
      assert.end();
    });
  });
});

it('get multiple docs with a composed key', function(assert) {
  var db = this.db;
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
