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

tests.recursive_create_db = function (tried,callback) {
  if(typeof tried === 'function') {
    callback = tried;
    tried = {tried:0, max_retries:5};
  }
  nano.db.destroy("db_cr2", function () {
    nano.db.create("db_cr2", function () {
      if(tried.tried === tried.max_retries) { callback(null,true); }
      else {
        tried.tried += 1;
        tests.recursive_create_db(tried,callback);
      }
    });
  });
};

tests.recursive_create_db_ok = function (_,v) {
  nano.db.destroy("db_cr2");
  assert.equal(v,true);
};

ensure(__filename, tests, module);
