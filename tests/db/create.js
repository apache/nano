var ensure   = require('ensure')
  , assert   = require('assert')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

tests.create_db = function (callback) {
  nano.db.destroy("db_cr1", function () {
    nano.db.create("db_cr1", callback);
  });
};

tests.create_db_ok = function (e,b) {
  nano.db.destroy("db_cr1");
  assert.isNull(e);
  assert.equal(b.ok, true);
};

ensure(__filename,tests,module,process.argv[2]);