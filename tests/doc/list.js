var vows    = require('/usr/lib/node_modules/vows/lib/vows')
  , assert  = require('assert')
  , async   = require('async')
  , cfg     = require('../../cfg/tests.js')
  , nano    = require('../../nano')(cfg)
  , db_name = "doc_li1"
  , db      = nano.use(db_name);

/*****************************************************************************
 * list_doc                                                                  *
 *****************************************************************************/
function list_doc(callback) {
  nano.db.create(db_name, function () {
    async.parallel(
      [ function(cb) { db.insert("foobar",  {"foo": "bar"}, cb); }
      , function(cb) { db.insert("barfoo",  {"bar": "foo"}, cb); }
      , function(cb) { db.insert("foobaz",  {"foo": "baz"}, cb); }
      ],
      function(err, results){
        db.list(callback);
      });
  });
}

function list_doc_ok(e,h,b) {
  assert.isNull(e);
  assert.equal(b.total_rows,3);
  assert.ok(b.rows);
  nano.db.destroy(db_name);
}

vows.describe('doc.list').addBatch({
  "list_doc": {
    topic: function () { list_doc(this.callback); }
  , "=": list_doc_ok
  }
}).exportTo(module);