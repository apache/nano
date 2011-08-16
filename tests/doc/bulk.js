var vows     = require('/usr/lib/node_modules/vows/lib/vows')
  , assert   = require('assert')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg);

function db_name(i) { return "doc_bu" + i; }
function db(i) { return nano.use(db_name(i)); }

/*****************************************************************************
 * bulks_docs                                                                *
 *****************************************************************************/
function bulk_docs(callback) {
  nano.db.create(db_name("a"), function () {
    db("a").bulk(
      {"docs":[{"key":"baz","name":"bazzel"},{"key":"bar","name":"barry"}]},
      function (e,h,r) {
        callback(e,h,r);
      });
  });
}

function bulk_docs_ok(e,h,b) {
  nano.db.destroy(db_name("a"));
  assert.isNull(e);
  assert.equal(b.length, "2");
  assert.ok(b[0].ok);
  assert.ok(b[1].ok);
}

vows.describe('doc.bulk').addBatch({
  "bulk_doc": {
    topic: function () { bulk_docs(this.callback); }
  , "=": bulk_docs_ok }
}).exportTo(module);