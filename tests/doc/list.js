var ensure   = require('ensure')
  , assert   = require('assert')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

function db_name(i) { return "doc_li" + i; }
function db(i) { return nano.use(db_name(i)); }

tests.list_doc = function (callback) {
  nano.db.create(db_name('a'), function () {
    async.parallel(
      [ function(cb) { db('a').insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db('a').insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db('a').insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db('a').list(callback);
      });
  });
};

tests.list_doc_ok = function (e,b) {
  nano.db.destroy(db_name('a'));
  assert.isNull(e);
  assert.equal(b.total_rows,3);
  assert.ok(b.rows);
};

tests.ns_list_doc = function (callback) {
  nano.db.create(db_name('b'), function () {
    async.parallel(
      [ function(cb) { db('b').insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db('b').insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db('b').insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        nano.request( { db: db_name('b')
                      , doc: "_all_docs"
                      , method: "GET"
                      , params: {limit: 1}
                      }, callback);
      });
  });
};

tests.ns_list_doc_ok = function (e,b) {
  nano.db.destroy(db_name('b'));
  assert.isNull(e);
  assert.equal(b.rows.length,1);
  assert.equal(b.total_rows,3);
  assert.ok(b.rows);
};

tests.list_doc_params = function (callback) {
  nano.db.create(db_name('c'), function () {
    async.parallel(
      [ function(cb) { db('c').insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db('c').insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db('c').insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db('c').list({startkey: '"c"'},callback);
      });
  });
};

tests.list_doc_params_ok = function (e,b) {
  nano.db.destroy(db_name('c'));
  assert.isNull(e);
  assert.equal(b.rows.length,2);
  assert.equal(b.total_rows,3);
  assert.ok(b.rows);
};

ensure(__filename, tests, module);