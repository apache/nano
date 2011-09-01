var ensure   = require('ensure')
  , assert   = require('assert')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

tests.destroy_db = function (callback) {
  nano.db.create("db_de1", function () {
    nano.db.destroy("db_de1", callback);
  });
};

tests.destroy_db_ok = function (e,b) {
  nano.db.destroy("db_de1");
  assert.isNull(e);
  assert.equal(b.ok, true);
};

ensure(__filename, tests, module);