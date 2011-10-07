var ensure = require('ensure')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , tests    = exports;

tests.insert_user = function (callback) {
  nano.use("_users").insert({_id:"org.couchdb.user:joe",type:"user",name:"joe",roles:[],password_sha:"c348c1794df04a0473a11234389e74a236833822", salt:"1"}, callback);
};

tests.auth_user = function (callback) {
  nano.auth("joe", "123", callback);
}

tests.insert_user_ok = function (e,b) {
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.ok(b.rev);
  this.t.ok(b.id);
};

tests.auth_user_ok = function (e,b) {
//  nano.use("_users").destroy("org.couchdb.user:joe", b.rev);
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.ok(b.rev);
  this.t.ok(b.id);
};

ensure(__filename,tests,module,process.argv[2]);