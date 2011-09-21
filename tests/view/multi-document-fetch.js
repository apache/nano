var ensure = require('ensure')
  , assert = require('assert')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , tests    = exports;

tests.multi_doc = function (callback) {
  nano.db.create("view_md1", function () {
    var db = nano.use("view_md1");
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"},"foo",cb); }
      , function(cb) { db.insert({"bar": "foo"},"bar",cb); }
      , function(cb) { db.insert({"foo": "baz"},"baz",cb); }
      ],
      function(err, results) {
        if(err) { callback(err); }
        db.insert({"views": { "by_id": {
                    "map": "function(doc) { emit(doc._id, doc); }" } }
                  }, '_design/alice', function(e,b,h) {
          db.view('alice','by_id', {keys: ['foo', 'bar'], include_docs: true},
            callback);
      });
    });
  });
};

tests.multi_doc_ok = function (err,view) {
  nano.db.destroy("view_md1");
  assert.isNull(err);
  assert.equal(view.rows.length, 2);
  assert.equal(view.rows[0].id, 'foo');
  assert.equal(view.rows[1].id, 'bar');
};

ensure(__filename, tests, module);