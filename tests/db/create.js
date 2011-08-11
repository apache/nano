var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

function createDb (name,callback) {
  nano.db.destroy(name, function () {
    nano.db.create(name, function (e,b) {
      callback(e,b);
      return;
    });
  });
}

function createDbWorked (e,b) {
  assert.isNull(e);
  assert.equal(b.ok, true);
}

vows.describe('nano.db.create').addBatch({
  "nano.db.create(foo)": {
    topic: function () { createDb("foo", this.callback); }
  , "=": createDbWorked
  }
}).exportTo(module);