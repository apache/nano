var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_li")
  , tests    = exports;

tests.list_db = function (callback) {
  nano.db.create(db_name('1'), function () {
    nano.db.list(callback);
  });
};

tests.list_db_ok = function (e,b) {
  nano.db.destroy(db_name('1'));
  this.t.notOk(e);
  this.t.notEqual(b.indexOf(db_name('1')),-1);
};

ensure(__filename,tests,module,process.argv[2]);