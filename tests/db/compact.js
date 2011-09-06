var ensure = require('ensure')
  , assert = require('assert')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , tests    = exports;

tests.compact_db = function (callback) {
  nano.db.create("db_co1", function () {
    var db = nano.use("db_co1");
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db.insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db.insert({"foo": "baz"},"foobaz",
          function (e,b) { db.destroy("foobaz", b._rev, cb); }); }
      ],
      function(err, results){
        db.compact(function () {
          db.info(callback);
        });
      });
  });
};

tests.compact_db_ok = function (err,list) {
  nano.db.destroy("db_co1");
  assert.isNull(err);
  assert.equal(list.doc_count, 3);
  assert.equal(list.doc_del_count, 0);
};

ensure(__filename,tests,module,process.argv[2]);