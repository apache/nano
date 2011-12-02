var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_de")
  , tests    = exports
  , couch
  ;

couch = nock(cfg.url)
    .put('/' + db_name('1'))
    .reply(201, "{\"ok\":true}\n", 
    { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
      location: cfg.url + '/' + db_name('1'),
      date: 'Fri, 02 Dec 2011 19:23:54 GMT',
      'content-type': 'application/json',
      'content-length': '12',
      'cache-control': 'must-revalidate' })
    .put('/' + db_name('1')  + '/foo', {"foo": "bar"})
    .reply(201, "{\"ok\":true,\"id\":\"foo\",\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}\n", 
    { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
      location: cfg.url + '/' + db_name('1') + '/foo',
      etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
      date: 'Fri, 02 Dec 2011 19:23:54 GMT',
      'content-type': 'application/json',
      'content-length': '66',
      'cache-control': 'must-revalidate' })
    .delete('/' + db_name('1') + 
              '/foo?rev=1-4c6114c65e295552ab1019e2b046b10e')
    .reply(200, "{\"ok\":true,\"id\":\"foo\",\"rev\":\"2-185ccf92154a9f24a4f4fd12233bf463\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"2-185ccf92154a9f24a4f4fd12233bf463"',
    date: 'Fri, 02 Dec 2011 19:23:55 GMT',
    'content-type': 'application/json',
    'content-length': '66',
    'cache-control': 'must-revalidate' });

tests.destroy_doc = function (callback) {
  var db = nano.use(db_name('1'));
  nano.db.create(db_name('1'), function () {
    db.insert({foo: "bar"}, "foo", function (_,b) {
      db.destroy("foo", b.rev, function (e,b) {
        callback(e,b);
        return;
      });
    });
  });
};

tests.destroy_doc_ok = function (e,b) {
  this.t.notOk(e, 'No errors');
  this.t.ok(b.ok, 'I got ok');
  this.t.equal(b.id, "foo", 'Id is foo');
  this.t.ok(b.rev, 'Got rev');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);