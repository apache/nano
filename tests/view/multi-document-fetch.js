var ensure = require('ensure')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("view_md")
  , tests    = exports
  ;

tests.multi_doc = function (callback) {
  nano.db.create(db_name('1'), function () {
    var db = nano.use(db_name('1'));
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
  nano.db.destroy(db_name('1'));
  this.t.notOk(err);
  this.t.equal(view.rows.length, 2);
  this.t.equal(view.rows[0].id, 'foo');
  this.t.equal(view.rows[1].id, 'bar');
};

ensure(__filename, tests, module,process.argv[2]);