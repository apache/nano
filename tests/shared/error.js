var ensure   = require('ensure')
  , err    = require('../../error')
  , tests    = exports;

tests.empty_error = function (callback) {
  callback(null,err.couch(null,null,null,null));
};

tests.empty_error_ok = function (_,e) {
  this.t.equal(e.message, "Unknown Error");
  this.t.equal(e['status-code'], 500);
  this.t.equal(e.error, "unknown");
  this.t.ok(typeof e.request === 'object');
};

tests.error_412 = function (callback) {
  callback(null,err.couch(null,null,null,412));
};

tests.error_412_ok = function (_,e) {
  this.t.equal(e.message, "Precondition Failed");
  this.t.equal(e['status-code'], 412);
  this.t.equal(e.error, "unknown");
  this.t.ok(typeof e.request === 'object');
};

ensure(__filename,tests,module,process.argv[2]);