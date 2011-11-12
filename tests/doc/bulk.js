var ensure   = require('ensure')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_bu")
  , tests    = exports;

function db(i) { return nano.use(db_name(i)); }

tests.bulk_docs = function (callback) {
  nano.db.create(db_name("a"), function () {
    db("a").bulk(
      {"docs":[{"key":"baz","name":"bazzel"},{"key":"bar","name":"barry"}]},
      function (e,r) {
        callback(e,r);
      });
  });
};

tests.bulk_docs_ok = function (e,b) {
  nano.db.destroy(db_name("a"));
  this.t.notOk(e);
  this.t.equal(b.length, 2);
  this.t.ok(b[0].id);
  this.t.ok(b[1].id);
};

ensure(__filename,tests,module,process.argv[2]);