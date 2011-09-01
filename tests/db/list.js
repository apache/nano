var ensure   = require('ensure')
  , assert   = require('assert')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

tests.list_db = function (callback) {
  nano.db.create("db_li1", function () {
    nano.db.list(callback);
  });
};

tests.list_db_ok = function (e,b) {
  nano.db.destroy("db_li1");
  assert.isNull(e);
  assert.notEqual(b.indexOf("db_li1"),-1);
};