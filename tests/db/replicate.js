var ensure   = require('ensure')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

tests.replicate_db = function (callback) {
  nano.db.create("db_re1", function () {
    var db      = nano.use("db_re1")
      , replica = nano.use("db_re1_replica");
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db.insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db.insert({"foo": "baz"},"foobaz",cb); }
      , function(cb) { nano.db.create("db_re1_replica", cb);     }
      ],
      function(err, results) {
        db.replicate("db_re1_replica", function() {
          replica.list(callback);
        });
      });
  });
};

tests.replicate_db_ok = function (e,b) {
  nano.db.destroy("db_re1");
  nano.db.destroy("db_re1_replica");
  this.t.notOk(e);
  this.t.equal(b.total_rows, 3);
  this.t.ok(b.rows);
};

ensure(__filename,tests,module,process.argv[2]);