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
    .put('/' + db_name('a'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a'),
        date: 'Fri, 02 Dec 2011 20:26:29 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('c'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('c'),
        date: 'Fri, 02 Dec 2011 20:26:29 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('b'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b'),
        date: 'Fri, 02 Dec 2011 20:26:29 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/foobar', {"foo": "bar"})
    .reply(201, "{\"ok\": true,\"id\": \"foobar\",\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a') + '/foobar',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 20:26:29 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/barfoo', {"bar": "foo"})
    .reply(201, "{\"ok\": true,\"id\": \"barfoo\",\"rev\": \"1-41412c293dade3fe73279cba8b4cece4\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a') + '/barfoo',
        etag: '"1-41412c293dade3fe73279cba8b4cece4"',
        date: 'Fri, 02 Dec 2011 20:26:29 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('c') + '/foobar', {"foo": "bar"})
    .reply(201, "{\"ok\": true,\"id\": \"foobar\",\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}\n",
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('c') + '/foobar',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 20:26:29 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/foobaz', {"foo": "baz"})
    .reply(201, "{\"ok\": true,\"id\": \"foobaz\",\"rev\": \"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a') + '/foobaz',
        etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
        date: 'Fri, 02 Dec 2011 20:26:30 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('c') + '/barfoo', {"bar": "foo"})
    .reply(201, "{\"ok\": true,\"id\": \"barfoo\",\"rev\": \"1-41412c293dade3fe73279cba8b4cece4\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('c') + '/barfoo',
        etag: '"1-41412c293dade3fe73279cba8b4cece4"',
        date: 'Fri, 02 Dec 2011 20:26:30 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .get('/' + db_name('a') + '/_all_docs')
    .reply(200, "{\"total_rows\": 3,\"offset\": 0,\"rows\": [\r\n{\"id\": \"barfoo\",\"key\": \"barfoo\",\"value\": {\"rev\": \"1-41412c293dade3fe73279cba8b4cece4\"}},\r\n{\"id\" :\"foobar\",\"key\": \"foobar\",\"value\": {\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}},\r\n{\"id\": \"foobaz\",\"key\": \"foobaz\",\"value\": {\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}}\r\n]}\n", 
      { 'transfer-encoding': 'chunked',
        server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        etag: '"AXA5PYPHH9S5SIRQ1NH1N0896"',
        date: 'Fri, 02 Dec 2011 20:26:30 GMT',
        'content-type': 'application/json',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('b') + '/foobar', {"foo": "bar"})
    .reply(201, "{\"ok\": true,\"id\": \"foobar\",\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b') + '/foobar',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 20:26:30 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('b') + '/barfoo', {"bar": "foo"})
    .reply(201, "{\"ok\": true,\"id\": \"barfoo\",\"rev\": \"1-41412c293dade3fe73279cba8b4cece4\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b') + '/barfoo',
        etag: '"1-41412c293dade3fe73279cba8b4cece4"',
        date: 'Fri, 02 Dec 2011 20:26:30 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('b') + '/foobaz', {"foo": "baz"})
    .reply(201, "{\"ok\": true,\"id\": \"foobaz\",\"rev\": \"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b') + '/foobaz',
        etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
        date: 'Fri, 02 Dec 2011 20:26:30 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('c') + '/foobaz', {"foo": "baz"})
    .reply(201, "{\"ok\": true,\"id\": \"foobaz\",\"rev\": \"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('c') + '/foobaz',
    etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
    date: 'Fri, 02 Dec 2011 20:26:30 GMT',
    'content-type': 'application/json',
    'content-length': '69',
    'cache-control': 'must-revalidate' })
    .delete('/' + db_name('a'))
    .reply(200, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        date: 'Fri, 02 Dec 2011 20:26:30 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .get('/' + db_name('b') + '/_all_docs?limit=1')
    .reply(200, "{\"total_rows\": 3,\"offset\": 0,\"rows\": [\r\n{\"id\": \"barfoo\",\"key\": \"barfoo\",\"value\": {\"rev\": \"1-41412c293dade3fe73279cba8b4cece4\"}}\r\n]}\n", 
      { 'transfer-encoding': 'chunked',
        server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        etag: '"7FE6ZA8SPA15QUXDRRHGRLWKO"',
        date: 'Fri, 02 Dec 2011 20:26:30 GMT',
        'content-type': 'application/json',
        'cache-control': 'must-revalidate' })
    .get('/' + db_name('c') + '/_all_docs?startkey=%22c%22')
    .reply(200, "{\"total_rows\": 3,\"offset\": 1,\"rows\": [\r\n{\"id\": \"foobar\",\"key\": \"foobar\",\"value\": {\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}},\r\n{\"id\": \"foobaz\",\"key\": \"foobaz\",\"value\": {\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}}\r\n]}\n", 
      { 'transfer-encoding': 'chunked',
        server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        etag: '"B5NTIXF7OO6RFK10FU94G5O3Y"',
        date: 'Fri, 02 Dec 2011 20:26:31 GMT',
        'content-type': 'application/json',
        'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.list_doc = function (callback) {
  nano.db.create(db_name('a'), function () {
    async.parallel(
      [ function(cb) { db('a').insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db('a').insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db('a').insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db('a').list(callback);
      });
  });
};

tests.list_doc_ok = function (e,b) {
  this.t.notOk(e, 'No err');
  this.t.equal(b.total_rows,3, '3 Rows');
  this.t.ok(b.rows, 'Got rows');
  this.t.ok(couch.isDone(), 'Nock is done');
};

tests.ns_list_doc = function (callback) {
  nano.db.create(db_name('b'), function () {
    async.parallel(
      [ function(cb) { db('b').insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db('b').insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db('b').insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        nano.request( { db: db_name('b')
                      , doc: "_all_docs"
                      , method: "GET"
                      , params: {limit: 1}
                      }, callback);
      });
  });
};

tests.ns_list_doc_ok = function (e,b) {
  this.t.notOk(e, 'Not Err');
  this.t.equal(b.rows.length,1, 'One Row');
  this.t.equal(b.total_rows,3, 'Out of 3');
  this.t.ok(b.rows, 'I got Rows');
  this.t.ok(couch.isDone(), 'Nock is done');
};

tests.list_doc_params = function (callback) {
  nano.db.create(db_name('c'), function () {
    async.parallel(
      [ function(cb) { db('c').insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db('c').insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db('c').insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db('c').list({startkey: 'c'},callback);
      });
  });
};

tests.list_doc_params_ok = function (e,b) {
  this.t.notOk(e, 'No errs');
  this.t.equal(b.rows.length,2, 'Two rows returned');
  this.t.equal(b.total_rows,3, 'Out of 3');
  this.t.ok(b.rows, 'That means we got rows');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);