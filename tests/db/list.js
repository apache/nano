var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

/*****************************************************************************
 * list_db                                                                   *
 *****************************************************************************/
function list_db (callback) {
  nano.db.create("db_li1", function () {
    nano.db.list(function (e,h,b) {
      callback(e,h,b);
      return;
    });
  });
}

function list_db_ok (e,h,b) {
  nano.db.destroy("db_li1");
  assert.isNull(e);
  assert.notEqual(b.indexOf("db_li1"),-1);
}

vows.describe('nano.db.list').addBatch({
  "list_db": {
    topic: function () { list_db(this.callback); }
  , "=": list_db_ok
  }
}).exportTo(module);