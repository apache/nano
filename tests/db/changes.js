var ensure = require('ensure')
  , assert = require('assert')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , tests    = exports;

function db_name(i) { return "doc_ch" + i; }
function db(i) { return nano.use(db_name(i)); }

tests.changes_db = function (callback) {
  nano.db.create(db_name("a"), function () {
    async.parallel(
      [ function(cb) { db("a").insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db("a").insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db("a").insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db("a").changes({since:2}, callback);
      });
  });
};

tests.changes_db_ok = function (e,b) {
  nano.db.destroy(db_name("a"));
  assert.isNull(e);
  assert.equal(b.results.length,1);
  assert.equal(b.last_seq,3);
};

ensure(__filename,tests,module,process.argv[2]);