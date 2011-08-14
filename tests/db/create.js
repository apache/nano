var vows    = require('/usr/lib/node_modules/vows/lib/vows')
  , assert  = require('assert')
  , cfg     = require('../../cfg/tests.js')
  , nano    = require('../../nano')(cfg);

/*****************************************************************************
 * create_db                                                                 *
 *****************************************************************************/
function create_db (callback) {
  nano.db.destroy("db_cr1", function () {
    nano.db.create("db_cr1", function (e,b) {
      callback(e,b);
      nano.db.destroy("db_cr1");
    });
  });
}

function create_db_ok(e,b) {
  assert.isNull(e);
  assert.equal(b.ok, true);
  nano.db.destroy("db_cr1");
}

/*****************************************************************************
 * recursive_retries_create_db                                               *
 *****************************************************************************/
function recursive_retries_create_db(tried,callback) {
  nano.db.destroy("db_cr2", function () {
    nano.db.create("db_cr2", function (e,b) {
      if(tried.tried === tried.max_retries) {
        callback(true);
        nano.db.destroy("db_cr2");
      }
      else {
        tried.tried += 1;
        recursive_retries_create_db(tried,callback);
      }
    });
  });
}

function recursive_retries_create_db_ok(v) {
  assert.equal(v,true);
  nano.db.destroy("db_cr2");
}

vows.describe('nano.db.create').addBatch({
  "create_db": {
    topic: function () { create_db(this.callback); }
  , "=": create_db_ok },
  "recursive_retries_create_db": {
    topic: function () { recursive_retries_create_db({tried:0, max_retries:5},this.callback); }
  , "=": recursive_retries_create_db_ok }
}).exportTo(module);