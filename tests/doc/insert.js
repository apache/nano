var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_in")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('b'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b'),
        date: 'Fri, 02 Dec 2011 20:15:11 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('a'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: 'http://nodejsbug.iriscouch.com/v061_doc_ina',
        date: 'Fri, 02 Dec 2011 20:15:11 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .post('/' + db_name('a'), {"foo": "bar"})
    .reply(201, "{\"ok\": true,\"id\": \"cb691f3e73482a0fb7e76bd3350037b4\",\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a') +
          '/cb691f3e73482a0fb7e76bd3350037b4',
        date: 'Fri, 02 Dec 2011 20:15:11 GMT',
        'content-type': 'application/json',
        'content-length': '95',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('b') + '/some%2Fpath', {"foo": "bar", "fn": "function () { return true; }", fn2: "function () { return false; }"})
    .reply(201, "{\"ok\": true,\"id\": \"some/path\",\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b') + '/some/path',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 20:15:11 GMT',
        'content-type': 'application/json',
        'content-length': '72',
        'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.insert_doc = function (callback) {
  nano.db.create(db_name("a"), function () {
    db("a").insert({foo: "bar"}, callback);
  });
};

tests.insert_doc_ok = function (e,b) {
  this.t.notOk(e, 'No eerz');
  this.t.ok(b.ok, 'This is ok');
  this.t.ok(b.rev, 'I GOT REVZ');
  this.t.ok(b.id, 'I got Id!');
  this.t.ok(couch.isDone(), 'Nock is done');
};

tests.insert_doc_path = function (callback) {
  nano.db.create(db_name("b"), function () {
    db("b").insert({foo: "bar", fn: function () { return true; },
      fn2: "function () { return false; }" }, 
      'some/path', callback);
  });
};

tests.insert_doc_path_ok = function (e,b) {
  this.t.notOk(e, 'Y U NO Errs');
  this.t.ok(b.ok, 'I got ok');
  this.t.ok(b.rev, 'I got rev');
  this.t.equal(b.id, "some/path", 'I got id, not over 21 though');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);