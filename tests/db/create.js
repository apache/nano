var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_cr")
  , tests    = exports
  , couch
  ;

couch = nock(cfg.url)
  .put('/' + db_name('1'))
  .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name('1'),
  date: 'Fri, 02 Dec 2011 01:44:15 GMT',
  'content-type': 'application/json',
  'content-length': '12',
  'cache-control': 'must-revalidate' });
    
tests.create_db = function (callback) {
  nano.db.create(db_name('1'), callback);
};

tests.create_db_ok = function (e,b) {
  this.t.notOk(e, 'Error shouldnt exist');
  this.t.equal(b.ok, true, 'Ok must be returned');
  this.t.ok(couch.isDone(), 'Nock not done');
};

ensure(__filename,tests,module,process.argv[2]);