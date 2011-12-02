var ensure   = require('ensure')
  , nock     = require('nock')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("db_re")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('1'))
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: '' + cfg.url + '/' + db_name('1'),
    date: 'Fri, 02 Dec 2011 02:29:28 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '_replica')
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '_replica',
    date: 'Fri, 02 Dec 2011 02:29:29 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/foobaz', {"foo":"baz"})
    .reply(201, "{\"ok\":true,\"id\":\"foobaz\",\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/foobaz',
    etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
    date: 'Fri, 02 Dec 2011 02:29:29 GMT',
    'content-type': 'application/json',
    'content-length': '69',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/barfoo', {"bar":"foo"})
    .reply(201, "{\"ok\":true,\"id\":\"barfoo\",\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/barfoo',
    etag: '"1-41412c293dade3fe73279cba8b4cece4"',
    date: 'Fri, 02 Dec 2011 02:29:29 GMT',
    'content-type': 'application/json',
    'content-length': '69',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/foobar', {"foo":"bar"})
    .reply(201, "{\"ok\":true,\"id\":\"foobar\",\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/foobar',
    etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
    date: 'Fri, 02 Dec 2011 02:29:29 GMT',
    'content-type': 'application/json',
    'content-length': '69',
    'cache-control': 'must-revalidate' })
    .post('/_replicate', 
      { "source": db_name('1') 
      , "target": db_name('1') + "_replica"
      })
    .reply(200, "{\"ok\":true,\"session_id\":\"47c3b30bde0d3bd943f5530aaec65602\",\"source_last_seq\":3,\"replication_id_version\":2,\"history\":[{\"session_id\":\"47c3b30bde0d3bd943f5530aaec65602\",\"start_time\":\"Fri, 02 Dec 2011 02:29:29 GMT\",\"end_time\":\"Fri, 02 Dec 2011 02:29:29 GMT\",\"start_last_seq\":0,\"end_last_seq\":3,\"recorded_seq\":3,\"missing_checked\":0,\"missing_found\":3,\"docs_read\":3,\"docs_written\":3,\"doc_write_failures\":0}]}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    date: 'Fri, 02 Dec 2011 02:29:29 GMT',
    'content-type': 'application/json',
    'content-length': '402',
    'cache-control': 'must-revalidate' })
    .get('/' + db_name('1') + '_replica/_all_docs')
    .reply(200, "{\"total_rows\":3,\"offset\":0,\"rows\":[\r\n{\"id\":\"barfoo\",\"key\":\"barfoo\",\"value\":{\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"}},\r\n{\"id\":\"foobar\",\"key\":\"foobar\",\"value\":{\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}},\r\n{\"id\":\"foobaz\",\"key\":\"foobaz\",\"value\":{\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}}\r\n]}\n", { 'transfer-encoding': 'chunked',
    server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"B0AI082A5BICTO8T8KCPEAN3Q"',
    date: 'Fri, 02 Dec 2011 02:29:30 GMT',
    'content-type': 'application/json',
    'cache-control': 'must-revalidate' });

tests.replicate_db = function (callback) {
  nano.db.create(db_name('1'), function () {
    var db      = nano.use(db_name('1'))
      , replica = nano.use(db_name('1')+"_replica");
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db.insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db.insert({"foo": "baz"},"foobaz",cb); }
      , function(cb) { nano.db.create(db_name('1')+"_replica", cb);     }
      ],
      function(err, results) {
        db.replicate(db_name('1')+"_replica", function() {
          replica.list(callback);
        });
      });
  });
};

tests.replicate_db_ok = function (e,b) {
  this.t.notOk(e, 'Y U NO ERR?');
  this.t.equal(b.total_rows, 3, 'I have 3 rows');
  this.t.ok(b.rows, 'And that means I have rows. Nuno is stoopid.');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);