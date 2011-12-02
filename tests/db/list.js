var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_li")
  , tests    = exports
  , couch
  ;

couch = nock(cfg.url)
  .put('/' + db_name('1'))
  .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name('1'),
  date: 'Fri, 02 Dec 2011 02:15:54 GMT',
  'content-type': 'application/json',
  'content-length': '12',
  'cache-control': 'must-revalidate' })
  .get('/_all_dbs')
  .reply(200, "[\"" + db_name('1') + "\"]\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  date: 'Fri, 02 Dec 2011 02:15:54 GMT',
  'content-type': 'application/json',
  'content-length': '81',
  'cache-control': 'must-revalidate' });

tests.list_db = function (callback) {
  nano.db.create(db_name('1'), function () {
    nano.db.list(callback);
  });
};

tests.list_db_ok = function (e,b) {
  this.t.notOk(e, 'Exception free since teh last run');
  this.t.notEqual(b.indexOf(db_name('1')),-1, 'I can haz db name?!');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);