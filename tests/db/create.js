var vows    = require('/usr/lib/node_modules/vows/lib/vows')
  , assert  = require('assert')
  , cfg     = require('../../cfg/tests.js')
  , nano    = require('../../nano')(cfg)
  , db_name = "foo";

/*****************************************************************************
 * create_db                                                                 *
 *****************************************************************************/
function create_db (callback) {
  nano.db.destroy(db_name, function () {
    nano.db.create(db_name, function (e,b) {
      callback(e,b);
      return;
    });
  });
}

function create_db_ok(e,b) {
  assert.isNull(e);
  assert.equal(b.ok, true);
}

/*****************************************************************************
 * create_db_recursive_error                                                 *
 *****************************************************************************/
function create_db_recursive_error(name, callback) {
  nano.db.destroy(db_name, function () {
    nano.db.create(db_name, function (e,b) {
      if(e) {
        callback(e);
      }
      else {
        create_db_recursive_error(name,callback);
      }
    });
  });
}

function create_db_recursive_error_ok(e,b) {
  assert.equal(e.reason, true);
}

/*****************************************************************************
 * nano.db.create(foo) :recursive :complex                                   *
 *****************************************************************************/
function recursive_retries_create_db(name, tried, callback) {
  nano.db.destroy(name, function () {
    nano.db.create(name, function (e,b) {
      if(tried.tried === tried.max_retries) {
        callback();
        return;
      }
      else {
        tried.tried += 1;
        recursive_create_db(name,tried,callback);
      }
    });
  });
}

vows.describe('nano.db.create').addBatch({
  "create_db": {
    topic: function () { create_db(this.callback); }
  , "=": create_db_ok },
  "create_db_recursive_error": {
    topic: function () { create_db_recursive_error(this.callback); }
  , "=": create_db_recursive_error }
}).exportTo(module);