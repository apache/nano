var ensure   = require('ensure')
  , nock     = require('nock')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_li")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
      .put('/v067_doc_lib')
      .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
      location: 'http://localhost:5984/v067_doc_lib',
      date: 'Fri, 24 Feb 2012 14:48:10 GMT',
      'content-type': 'application/json',
      'content-length': '12',
      'cache-control': 'must-revalidate' })
  .put('/v067_doc_lia')
  .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  location: 'http://localhost:5984/v067_doc_lia',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'content-length': '12',
  'cache-control': 'must-revalidate' })
  .put('/v067_doc_lib/foobaz', "{\"foo\":\"baz\"}")
  .reply(201, "{\"ok\":true,\"id\":\"foobaz\",\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  location: 'http://localhost:5984/v067_doc_lib/foobaz',
  etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .put('/v067_doc_lib/barfoo', "{\"bar\":\"foo\"}")
  .reply(201, "{\"ok\":true,\"id\":\"barfoo\",\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  location: 'http://localhost:5984/v067_doc_lib/barfoo',
  etag: '"1-41412c293dade3fe73279cba8b4cece4"',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .put('/v067_doc_lib/foobar', "{\"foo\":\"bar\"}")
  .reply(201, "{\"ok\":true,\"id\":\"foobar\",\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  location: 'http://localhost:5984/v067_doc_lib/foobar',
  etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
    .put('/v067_doc_lia/foobar', "{\"foo\":\"bar\"}")
  .reply(201, "{\"ok\":true,\"id\":\"foobar\",\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  location: 'http://localhost:5984/v067_doc_lia/foobar',
  etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .put('/v067_doc_lia/barfoo', "{\"bar\":\"foo\"}")
  .reply(201, "{\"ok\":true,\"id\":\"barfoo\",\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  location: 'http://localhost:5984/v067_doc_lia/barfoo',
  etag: '"1-41412c293dade3fe73279cba8b4cece4"',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .put('/v067_doc_lia/foobaz', "{\"foo\":\"baz\"}")
  .reply(201, "{\"ok\":true,\"id\":\"foobaz\",\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  location: 'http://localhost:5984/v067_doc_lia/foobaz',
  etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'content-length': '69',
  'cache-control': 'must-revalidate' })
  .post('/v067_doc_lib/_all_docs?include_docs=true', "{\"keys\":[\"foobar\",\"barfoo\"]}")
  .reply(200, "{\"total_rows\":3,\"offset\":0,\"rows\":[\r\n{\"id\":\"foobar\",\"key\":\"foobar\",\"value\":{\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"},\"doc\":{\"_id\":\"foobar\",\"_rev\":\"1-4c6114c65e295552ab1019e2b046b10e\",\"foo\":\"bar\"}},\r\n{\"id\":\"barfoo\",\"key\":\"barfoo\",\"value\":{\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"},\"doc\":{\"_id\":\"barfoo\",\"_rev\":\"1-41412c293dade3fe73279cba8b4cece4\",\"bar\":\"foo\"}}\r\n]}\n", { 'transfer-encoding': 'chunked',
  server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  etag: '"7X2D919KBXMJ5Z6JJ4RCZXZCB"',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'cache-control': 'must-revalidate' })
  .post('/v067_doc_lia/_all_docs?include_docs=true', "{\"keys\":[\"foobar\"]}")
  .reply(200, "{\"total_rows\":3,\"offset\":0,\"rows\":[\r\n{\"id\":\"foobar\",\"key\":\"foobar\",\"value\":{\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"},\"doc\":{\"_id\":\"foobar\",\"_rev\":\"1-4c6114c65e295552ab1019e2b046b10e\",\"foo\":\"bar\"}}\r\n]}\n", { 'transfer-encoding': 'chunked',
  server: 'CouchDB/1.1.1 (Erlang OTP/R14B02)',
  etag: '"2GOFI0AQ1BKE16DH52QAWBY0K"',
  date: 'Fri, 24 Feb 2012 14:48:10 GMT',
  'content-type': 'application/json',
  'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.fetch_doc = function (callback) {
  nano.db.create(db_name('a'), function () {
    async.parallel(
      [ function(cb) { db('a').insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db('a').insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db('a').insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
          db('a').fetch({ keys: ["foobar"]}, callback);
      });
  });
};

tests.fetch_doc_ok = function (e,b) {
  this.t.notOk(e, 'No err');
  this.t.equal(b.rows.length,1, 'One Row');
  this.t.equal(b.total_rows,3, 'Out of 3');
  this.t.ok(b.rows, 'Got rows');
  this.t.ok(couch.isDone(), 'Nock is done');
};

tests.fetch_multiple = function (callback) {
  nano.db.create(db_name('b'), function () {
    async.parallel(
      [ function(cb) { db('b').insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db('b').insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db('b').insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
          db('b').fetch({keys: ["foobar", "barfoo" ]}, callback);
      });
  });
};

tests.fetch_multiple_ok = function (e,b) {
  this.t.notOk(e, 'Not Err');
  this.t.equal(b.rows.length,2, 'Two Rows');
  this.t.equal(b.total_rows,3, 'Out of 3');
  this.t.ok(b.rows, 'I got Rows');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);