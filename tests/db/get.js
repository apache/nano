var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

tests.get_db = function (callback) {
  nano.db.create("db_ge1", function () {
    nano.db.get("db_ge1", function (e,b) {
      callback(e,b);
      return;
    });
  });
};

tests.get_db_ok = function (e,b) {
  nano.db.destroy("db_ge1");
  this.t.notOk(e);
  this.t.equal(b.doc_count,0);
  this.t.equal(b.doc_del_count,0);
  this.t.equal(b.db_name,"db_ge1");
};

ensure(__filename,tests,module,process.argv[2]);