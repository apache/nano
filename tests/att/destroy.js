var vows     = require('vows')
  , assert   = require('assert')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg);

function db_name(i) { return "att_de" + i; }
function db(i) { return nano.use(db_name(i)); }

/*****************************************************************************
 * att_des                                                                   *
 *****************************************************************************/
function att_des(callback) {
  nano.db.create(db_name("a"), function () {
    db("a").attachment.insert("new", "att", "Hello World!", "text/plain",
      function (e,b) {
        db("a").attachment.destroy("new", "att", b.rev, callback);
    });
  });
}

function att_des_ok(e,b) {
  nano.db.destroy(db_name("a"));
  assert.isNull(e);
  assert.ok(b.ok);
  assert.equal(b.id, "new");
}

vows.describe('attachment.destroy').addBatch({
  "att_del": {
    topic: function () { att_des(this.callback); }
  , "=": att_des_ok }
}).exportTo(module);
