var ensure   = require('ensure')
  , nock     = require('nock')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_co")
  , tests    = exports
  , couch
  ;

couch =   nock(cfg.url)
  .put('/' + db_name("1"))
  .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name("1") + '',
  date: 'Fri, 02 Dec 2011 01:27:15 GMT',
  'content-type': 'application/json',
  'content-length': '12',
  'cache-control': 'must-revalidate' })
  .put('/' + db_name("1") + '/foobar', {"foo":"bar"})
  .reply(201, "{\"ok\":true,\"id\":\"foobar\",\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name("1") + '/foobar',
  etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
  date: 'Fri, 02 Dec 2011 01:27:15 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .put('/' + db_name("1") + '/barfoo', {"bar":"foo"})
  .reply(201, "{\"ok\":true,\"id\":\"barfoo\",\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name("1") + '/barfoo',
  etag: '"1-41412c293dade3fe73279cba8b4cece4"',
  date: 'Fri, 02 Dec 2011 01:27:15 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .put('/' + db_name("1") + '/foobaz', {"foo":"baz"})
  .reply(201, "{\"ok\":true,\"id\":\"foobaz\",\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name("1") + '/foobaz',
  etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
  date: 'Fri, 02 Dec 2011 01:27:15 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .delete('/' + db_name("1") + '/foobaz?rev=1-cfa20dddac397da5bf0be2b50fb472fe')
  .reply(200, "{\"ok\":true,\"id\":\"foobaz\",\"rev\":\"2-a2a31b340cec15e18fbe6c82db6d2c2a\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  etag: '"2-a2a31b340cec15e18fbe6c82db6d2c2a"',
  date: 'Fri, 02 Dec 2011 01:27:16 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .post('/' + db_name("1") + '/_compact')
  .reply(202, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  date: 'Fri, 02 Dec 2011 01:27:16 GMT',
  'content-type': 'application/json',
  'content-length': '12',
  'cache-control': 'must-revalidate' })
  .get('/' + db_name("1") + '')
  .reply(200, "{\"db_name\":\"" + db_name("1") + "\",\"doc_count\":3,\"doc_del_count\":0,\"update_seq\":4,\"purge_seq\":0,\"compact_running\":false,\"disk_size\":8281,\"instance_start_time\":\"1322789235294158\",\"disk_format_version\":5,\"committed_update_seq\":4}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  date: 'Fri, 02 Dec 2011 01:27:17 GMT',
  'content-type': 'application/json',
  'content-length': '218',
  'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.compact_db = function (callback) {
  nano.db.create(db_name('1'), function () {
    async.parallel(
      [ function(cb) { db('1').insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db('1').insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db('1').insert({"foo": "baz"},"foobaz",
          function (e,b) { db('1').destroy("foobaz", b.rev, cb); }); }
      ],
      function(err, results){
        db('1').compact(function () {
          db('1').info(callback);
        });
      });
  });
};

tests.compact_db_ok = function (err,list) {
  this.t.notOk(err, 'No err');
  this.t.equal(list.doc_count, 3, 'Doc count is 3');
  this.t.equal(list.doc_del_count, 0, 'No deleted documents');
  this.t.ok(couch.isDone(), 'Nock not done');
};

ensure(__filename,tests,module,process.argv[2]);