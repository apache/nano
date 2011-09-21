var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

tests.destroy_db = function (callback) {
  nano.db.create("db_de1", function () {
    nano.db.destroy("db_de1", callback);
  });
};

tests.destroy_db_ok = function (e,b) {
  this.t.notOk(e);
  this.t.equal(b.ok, true);
};

ensure(__filename,tests,module,process.argv[2]);