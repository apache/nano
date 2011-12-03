var ensure = require('ensure')
  , nock   = require('nock')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("view_co")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('1'))
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1'),
    date: 'Fri, 02 Dec 2011 03:09:53 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/foobar', {"foo":"bar"})
    .reply(201, "{\"ok\":true,\"id\":\"foobar\",\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/foobar',
    etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
    date: 'Fri, 02 Dec 2011 03:09:54 GMT',
    'content-type': 'application/json',
    'content-length': '69',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/barfoo', {"bar":"foo"})
    .reply(201, "{\"ok\":true,\"id\":\"barfoo\",\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/barfoo',
    etag: '"1-41412c293dade3fe73279cba8b4cece4"',
    date: 'Fri, 02 Dec 2011 03:09:54 GMT',
    'content-type': 'application/json',
    'content-length': '69',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/foobaz', {"foo":"baz"})
    .reply(201, "{\"ok\":true,\"id\":\"foobaz\",\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/foobaz',
    etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
    date: 'Fri, 02 Dec 2011 03:09:54 GMT',
    'content-type': 'application/json',
    'content-length': '69',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('1') + '/_design/alice',
      { "views":
        {"by_id":{"map":"function(doc) { emit(doc._id, doc); }"}}})
    .reply(201, "{\"ok\":true,\"id\":\"_design/alice\",\"rev\":\"1-14e6bcd59de8d02b840c4db3c95637c5\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('1') + '/_design/alice',
    etag: '"1-14e6bcd59de8d02b840c4db3c95637c5"',
    date: 'Fri, 02 Dec 2011 03:09:55 GMT',
    'content-type': 'application/json',
    'content-length': '76',
    'cache-control': 'must-revalidate' })
    .delete('/' + db_name('1') + '/foobaz?rev=1-cfa20dddac397da5bf0be2b50fb472fe')
    .reply(200, "{\"ok\":true,\"id\":\"foobaz\",\"rev\":\"2-a2a31b340cec15e18fbe6c82db6d2c2a\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"2-a2a31b340cec15e18fbe6c82db6d2c2a"',
    date: 'Fri, 02 Dec 2011 03:09:55 GMT',
    'content-type': 'application/json',
    'content-length': '69',
    'cache-control': 'must-revalidate' })
    .post('/' + db_name('1') + '/_compact/alice')
    .reply(202, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    date: 'Fri, 02 Dec 2011 03:09:55 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .get('/' + db_name('1') + '/_design/alice/_view/by_id')
    .reply(200, "{\"total_rows\":2,\"offset\":0,\"rows\":[\r\n{\"id\":\"barfoo\",\"key\":\"barfoo\",\"value\":{\"_id\":\"barfoo\",\"_rev\":\"1-41412c293dade3fe73279cba8b4cece4\",\"bar\":\"foo\"}},\r\n{\"id\":\"foobar\",\"key\":\"foobar\",\"value\":{\"_id\":\"foobar\",\"_rev\":\"1-4c6114c65e295552ab1019e2b046b10e\",\"foo\":\"bar\"}}\r\n]}\n", { 'transfer-encoding': 'chunked',
    server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"AZYB6353W6O0LS9Z4M13CDL7R"',
    date: 'Fri, 02 Dec 2011 03:09:56 GMT',
    'content-type': 'application/json',
    'cache-control': 'must-revalidate' });

tests.compact_view = function (callback) {
  nano.db.create(db_name('1'), function () {
    var db = nano.use(db_name('1'));
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db.insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db.insert({"foo": "baz"},"foobaz",cb); }
      ],
      function(err, results) {
        var foobaz_rev = results[2][0].rev;
        db.insert({"views": { "by_id": {
                    "map": "function(doc) { emit(doc._id, doc); }" } }
                  }, '_design/alice', function(e,b,h) {
          db.destroy('foobaz', foobaz_rev, function (e,b,h) {
            db.view.compact('alice', function(e,b,h) {
              db.view('alice','by_id', callback);
            });
          });
        });
      });
  });
};

tests.compact_view_ok = function (err,view) {
  this.t.notOk(err, 'STD Free, no errs');
  this.t.equal(view.total_rows, 2, 'Total rows is two');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename, tests, module,process.argv[2]);