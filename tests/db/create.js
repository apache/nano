var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_cr")
  , tests    = exports;

tests.create_db = function (callback) {
  nano.db.destroy(db_name('1'), function () {
    nano.db.create(db_name('1'), callback);
  });
};

tests.create_db_ok = function (e,b) {
  nano.db.destroy(db_name('1'));
  this.t.notOk(e);
  this.t.equal(b.ok, true);
};

ensure(__filename,tests,module,process.argv[2]);