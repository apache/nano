var ensure   = require('ensure')
  , assert   = require('assert')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

tests.recursive_create_view = function (tried,callback) {
  if(typeof tried === 'function') {
    callback = tried;
    tried = {tried:0, max_retries:2};
  }
  nano.db.create("view_qu1", function () {
    var db = nano.use("view_qu1");
    db.view('cats','by_id', function (e,b,h) {
      if(tried.tried === tried.max_retries) { return callback('failed'); }
      if(e && e.message === 'missing') {
        return db.insert({"views": { "by_id": {
                    "map": "function(doc) { emit(doc._id, doc); }" } }
                  }, '_design/cats', function () {
          tried.tried += 1;
          tests.recursive_create_view(tried,callback);
        });
      }
      return callback(e,b,h);
    });
  });
};

tests.recursive_create_view_ok = function (e,view) {
  nano.db.destroy("view_qu1");
  assert.isNull(e);
  assert.equal(view.total_rows,0);
};

ensure(__filename, tests, module);
