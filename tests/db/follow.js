'use strict';

var async = require('async');
var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;

it('should insert a bunch of items', function(assert) {
  var db = this.db;
  async.parallel([
    function(cb) { db.insert({'foo': 'bar'}, 'foobar', cb); },
    function(cb) { db.insert({'bar': 'foo'}, 'barfoo', cb); },
    function(cb) { db.insert({'foo': 'baz'}, 'foobaz', cb); }
  ], function(error) {
    assert.equal(error, undefined, 'should stored docs');
    assert.end();
  });
});

if (process.env.NOCK_OFF === 'true') {
  var feed1;

  it('should be able to get the changes feed', function(assert) {
    var db = this.db;
    var i = 3;

    feed1 = db.follow({since: 3});

    feed1.on('change', function(change) {
      assert.ok(change, 'change existed');
      assert.equal(change.seq, i + 1, 'seq is set correctly');
      ++i;
      if (i === 4) {
        console.log(change, i);
        assert.end();
      }
    });

    feed1.follow();

    setTimeout(function() {
      db.insert({'bar': 'baz'}, 'barbaz');
    }, 100);
  });

  it('should see changes since `seq:3`', function(assert) {
    var db = this.db;
    var feed = db.follow({since: 3}, function(error, change) {
      assert.equal(error, null, 'should not have errors');
      assert.ok(change, 'change existed');
      feed.die();
      feed1.die();
      setImmediate(assert.end);
    });
  });
}
