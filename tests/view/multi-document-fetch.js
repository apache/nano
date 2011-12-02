var ensure = require('ensure')
  , nock   = require('nock')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("view_md")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('1'))
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1'),
    date: 'Fri, 02 Dec 2011 02:58:50 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/foo', {"foo":"bar"})
    .reply(201, "{\"ok\":true,\"id\":\"foo\",\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/foo',
    etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
    date: 'Fri, 02 Dec 2011 02:58:51 GMT',
    'content-type': 'application/json',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/baz', {"foo":"baz"})
    .reply(201, "{\"ok\":true,\"id\":\"baz\",\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/baz',
    etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
    date: 'Fri, 02 Dec 2011 02:58:51 GMT',
    'content-type': 'application/json',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/bar', {"bar":"foo"})
    .reply(201, "{\"ok\":true,\"id\":\"bar\",\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/bar',
    etag: '"1-41412c293dade3fe73279cba8b4cece4"',
    date: 'Fri, 02 Dec 2011 02:58:51 GMT',
    'content-type': 'application/json',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/_design/alice'
        , { "views":
            { "by_id":
              { "map": "function(doc) { emit(doc._id, doc); }"
              }
            }
          })
    .reply(201, "{\"ok\":true,\"id\":\"_design/alice\",\"rev\":\"1-14e6bcd59de8d02b840c4db3c95637c5\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/_design/alice',
    etag: '"1-14e6bcd59de8d02b840c4db3c95637c5"',
    date: 'Fri, 02 Dec 2011 02:58:52 GMT',
    'content-type': 'application/json',
    'content-length': '76',
    'cache-control': 'must-revalidate' })
    .post('/' + db_name('1') + '/_design/alice/_view/by_id?include_docs=true'
         , {"keys":["foo","bar"]})
    .reply(200, "{\"total_rows\":3,\"offset\":2,\"rows\":[\r\n{\"id\":\"foo\",\"key\":\"foo\",\"value\":{\"_id\":\"foo\",\"_rev\":\"1-4c6114c65e295552ab1019e2b046b10e\",\"foo\":\"bar\"},\"doc\":{\"_id\":\"foo\",\"_rev\":\"1-4c6114c65e295552ab1019e2b046b10e\",\"foo\":\"bar\"}},\r\n{\"id\":\"bar\",\"key\":\"bar\",\"value\":{\"_id\":\"bar\",\"_rev\":\"1-41412c293dade3fe73279cba8b4cece4\",\"bar\":\"foo\"},\"doc\":{\"_id\":\"bar\",\"_rev\":\"1-41412c293dade3fe73279cba8b4cece4\",\"bar\":\"foo\"}}\r\n]}\n", { 'transfer-encoding': 'chunked',
    server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"MZ8GS7KA63WNTZ3RI58JU64R"',
    date: 'Fri, 02 Dec 2011 02:58:52 GMT',
    'content-type': 'application/json',
    'cache-control': 'must-revalidate' });

tests.multi_doc = function (callback) {
  nano.db.create(db_name('1'), function () {
    var db = nano.use(db_name('1'));
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"},"foo",cb); }
      , function(cb) { db.insert({"bar": "foo"},"bar",cb); }
      , function(cb) { db.insert({"foo": "baz"},"baz",cb); }
      ],
      function(err, results) {
        if(err) { callback(err); }
        db.insert({"views": { "by_id": {
                    "map": "function(doc) { emit(doc._id, doc); }" } }
                  }, '_design/alice', function(e,b,h) {
          db.view('alice','by_id', {keys: ['foo', 'bar'], include_docs: true},
            callback);
      });
    });
  });
};

tests.multi_doc_ok = function (err,view) {
  this.t.notOk(err, 'I got no errors');
  this.t.equal(view.rows.length, 2, 'And two rows');
  this.t.equal(view.rows[0].id, 'foo', 'Got an id of foo');
  this.t.equal(view.rows[1].id, 'bar', 'And an id of bar');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename, tests, module,process.argv[2]);