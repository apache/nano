var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

/*****************************************************************************
 * compact_db                                                                *
 *****************************************************************************/
function compact_db(callback) {
  nano.db.create("db_co1", function () {
    var db = nano.use("db_co1");
    async.parallel(
      [ function(cb) { db.insert("foobar",  {"foo": "bar"}, cb); }
      , function(cb) { db.insert("barfoo",  {"bar": "foo"}, cb); }
      , function(cb) { db.insert("foobaz",  {"foo": "baz"},
          function (e,h,b) { db.destroy("foobaz", b._rev, cb); }); }
      ],
      function(err, results){
        db.compact(function () {
          db.info(function(e,h,b) {
            callback(null,b);
            return;
          });
        });
      });
  });
}

function compact_db_ok(err,list) {
  nano.db.destroy("db_co1");
  assert.equal(list.doc_count, 3);
  assert.equal(list.doc_del_count, 0);
}

vows.describe('nano.db.compact').addBatch({
  "destroy_db": {
    topic: function () { compact_db(this.callback); }
  , "=": compact_db_ok
  }
}).exportTo(module);