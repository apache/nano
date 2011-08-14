var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

function compact_db(callback) {
  nano.db.create("db_co1", function () {
    var db = nano.use("db_co1");
    async.parallel(
      [ function(cb) { db.insert("foobar",  {"foo": "bar"}, cb); }
      , function(cb) { db.insert("barfoo",  {"bar": "foo"}, cb); }
      , function(cb) { db.insert("foobaz",  {"foo": "baz"}, cb); }
      ],
      function(err, results){
        nano.db.compact("db_co1", callback);
      });
  });
}

function compact_db_ok(e,h,b) {
  assert.isNull(e);
  assert.equal(b.ok, true);
  nano.db.destroy("db_co1");
}

vows.describe('nano.db.compact').addBatch({
  "destroy_db": {
    topic: function () { compact_db(this.callback); }
  , "=": compact_db_ok
  }
}).exportTo(module);