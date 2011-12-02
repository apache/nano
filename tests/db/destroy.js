var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_de")
  , tests    = exports
  , couch
  ;

couch = nock(cfg.url)
    .put('/' + db_name('1'))
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1'),
    date: 'Fri, 02 Dec 2011 01:50:45 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .delete('/' + db_name('1'))
    .reply(200, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    date: 'Fri, 02 Dec 2011 01:50:46 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' });

tests.destroy_db = function (callback) {
  nano.db.create(db_name('1'), function () {
    nano.db.destroy(db_name('1'), callback);
  });
};

tests.destroy_db_ok = function (e,b) {
  this.t.notOk(e, 'Error says Yey');
  this.t.equal(b.ok, true, '{ok: yeah}');
  this.t.ok(couch.isDone(), 'Nock not done');
};

ensure(__filename,tests,module,process.argv[2]);