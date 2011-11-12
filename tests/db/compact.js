var ensure   = require('ensure')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_co")
  , tests    = exports
  ;

function db(i) { return nano.use(db_name(i)); }

tests.compact_db = function (callback) {
  nano.db.create(db_name('1'), function () {
    async.parallel(
      [ function(cb) { db('1').insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db('1').insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db('1').insert({"foo": "baz"},"foobaz",
          function (e,b) { db('1').destroy("foobaz", b._rev, cb); }); }
      ],
      function(err, results){
        db('1').compact(function () {
          db('1').info(callback);
        });
      });
  });
};

tests.compact_db_ok = function (err,list) {
  nano.db.destroy(db_name('1'));
  this.t.notOk(err);
  this.t.equal(list.doc_count, 3);
  this.t.equal(list.doc_del_count, 0);
};

ensure(__filename,tests,module,process.argv[2]);