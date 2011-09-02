var ensure = require('ensure')
  , assert = require('assert')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , tests    = exports;

tests.compact_view = function (callback) {
  nano.db.create("view_co1", function () {
    var db = nano.use("view_co1");
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db.insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db.insert({"foo": "baz"},"foobaz",cb); }
      ],
      function(err, results) {
        var foobaz_rev = results[2][0].rev;
        db.insert({"views": { "by_id": {
                    "map": "function(doc) { emit(doc._id, doc); }" } }
                  }, '_design/alice', function(e,b,h) {
          db.destroy('foobaz', foobaz_rev, function (e,b,h) {
            db.view.compact('alice', function(e,b,h) {
              db.view('alice','by_id', callback);
            });
          });
        });
      });
  });
};

tests.compact_view_ok = function (err,view) {
  nano.db.destroy("view_co1");
  assert.isNull(err);
  assert.equal(view.total_rows, 2);
};

ensure(__filename, tests, module);