var vows     = require('vows')
  , assert   = require('assert')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = "doc_li1"
  , db2_name = "doc_li2"
  , db3_name = "doc_li3"
  , db       = nano.use(db_name)
  , db2      = nano.use(db2_name)
  , db3      = nano.use(db3_name);

/*****************************************************************************
 * list_doc                                                                  *
 *****************************************************************************/
function list_doc(callback) {
  nano.db.create(db_name, function () {
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db.insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db.insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db.list(callback);
      });
  });
}

function list_doc_ok(e,h,b) {
  nano.db.destroy(db_name);
  assert.isNull(e);
  assert.equal(b.total_rows,3);
  assert.ok(b.rows);
}

/*****************************************************************************
 * ns_list_doc                                                               *
 *****************************************************************************/
function ns_list_doc(callback) {
  nano.db.create(db2_name, function () {
    async.parallel(
      [ function(cb) { db2.insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db2.insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db2.insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        nano.request( { db: db2_name
                      , doc: "_all_docs"
                      , method: "GET"
                      , params: {limit: 1}
                      }, callback);
      });
  });
}

function ns_list_doc_ok(e,h,b) {
  nano.db.destroy(db2_name);
  assert.isNull(e);
  assert.equal(b.rows.length,1);
  assert.equal(b.total_rows,3);
  assert.ok(b.rows);
}

/*****************************************************************************
 * list_doc_params                                                           *
 *****************************************************************************/
function list_doc_params(callback) {
  nano.db.create(db3_name, function () {
    async.parallel(
      [ function(cb) { db3.insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db3.insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db3.insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db3.list({startkey: '"c"'},callback);
      });
  });
}

function list_doc_params_ok(e,h,b) {
  nano.db.destroy(db3_name);
  assert.isNull(e);
  assert.equal(b.rows.length,2);
  assert.equal(b.total_rows,3);
  assert.ok(b.rows);
}



vows.describe('doc.list').addBatch({
  "list_doc": {
    topic: function () { list_doc(this.callback); }
  , "=": list_doc_ok },
  "ns_list_doc": {
    topic: function () { ns_list_doc(this.callback); }
  , "=": ns_list_doc_ok },
  "list_doc_params": {
    topic: function () { list_doc_params(this.callback); }
  , "=": list_doc_params_ok }
}).exportTo(module);