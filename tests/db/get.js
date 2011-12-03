var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_ge")
  , tests    = exports
  , couch
  ;

couch = nock(cfg.url)
  .put('/' + db_name('1'))
  .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name('1'),
  date: 'Fri, 02 Dec 2011 02:00:17 GMT',
  'content-type': 'application/json',
  'content-length': '12',
  'cache-control': 'must-revalidate' })
  .get('/' + db_name('1'))
  .reply(200, "{\"db_name\":\"" + db_name('1') + "\",\"doc_count\":0,\"doc_del_count\":0,\"update_seq\":0,\"purge_seq\":0,\"compact_running\":false,\"disk_size\":79,\"instance_start_time\":\"1322791217213709\",\"disk_format_version\":5,\"committed_update_seq\":0}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  date: 'Fri, 02 Dec 2011 02:00:17 GMT',
  'content-type': 'application/json',
  'content-length': '216',
  'cache-control': 'must-revalidate' });

tests.get_db = function (callback) {
  nano.db.create(db_name('1'), function () {
    nano.db.get(db_name('1'), function (e,b) {
      callback(e,b);
      return;
    });
  });
};

tests.get_db_ok = function (e,b) {
  this.t.notOk(e, 'No errors');
  this.t.equal(b.doc_count,0, 'No docs');
  this.t.equal(b.doc_del_count,0, 'No deleted docs');
  this.t.equal(b.db_name,db_name('1'), 'DB name is correct');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);