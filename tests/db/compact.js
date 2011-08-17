var vows   = require('vows')
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
      [ function(cb) { db.insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db.insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db.insert({"foo": "baz"},"foobaz",
          function (e,h,b) { db.destroy("foobaz", b._rev, cb); }); }
      ],
      function(err, results){
        db.compact(function () {
          db.info(function(e,_,b) {
            callback(e,b);
            return;
          });
        });
      });
  });
}

function compact_db_ok(err,list) {
  nano.db.destroy("db_co1");
  assert.isNull(err);
  assert.equal(list.doc_count, 3);
  assert.equal(list.doc_del_count, 0);
}

vows.describe('nano.db.compact').addBatch({
  "compact_db": {
    topic: function () { compact_db(this.callback); }
  , "=": compact_db_ok
  }
}).exportTo(module);