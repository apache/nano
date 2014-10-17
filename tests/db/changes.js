'use strict';

var async = require('async');
var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;

it('should be able to insert three documents', function(assert) {
  var db = this.db;
  async.parallel([
    function(cb) { db.insert({'foo': 'bar'}, 'foobar', cb); },
    function(cb) { db.insert({'bar': 'foo'}, 'barfoo', cb); },
    function(cb) { db.insert({'foo': 'baz'}, 'foobaz', cb); }
  ], function(error) {
    assert.equal(error, undefined, 'should store docs');
    assert.end();
  });
});

it('should be able to receive changes since seq:2', function(assert) {
  var db = this.db;
  db.changes({since:2}, function(error, response) {
    assert.equal(error, null, 'gets response from changes');
    assert.equal(response.results.length, 1, 'gets one result');
    assert.equal(response['last_seq'], 3, 'seq is 3');
    assert.end();
  });
});
