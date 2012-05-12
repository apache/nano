var specify  = require('specify')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  , pixel    = helpers.pixel
  ;

var mock = nock(helpers.couch, "att/get");

/*
couch = nock(cfg.url)
    .put('/' + db_name('a'))
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a'),
    date: 'Fri, 02 Dec 2011 16:34:28 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    
    .put('/' + db_name('a') + '/new/att', '"Hello"')
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"1-5142a2e74e1ec33e6e5b621418210283\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a') + '/new/att',
    etag: '"1-5142a2e74e1ec33e6e5b621418210283"',
    date: 'Fri, 02 Dec 2011 16:34:29 GMT',
    'content-type': 'text/plain;charset=utf-8',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    
    .put('/' + db_name('a') + '/new/att?rev=1-5142a2e74e1ec33e6e5b621418210283'
    , new Buffer(pixel, 'base64').toString())
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"2-3b1f88c637fde74a486cf3ce5558b47e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a') + '/new/att',
    etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
    date: 'Fri, 02 Dec 2011 16:34:29 GMT',
    'content-type': 'text/plain;charset=utf-8',
    'content-length': '66',
    'cache-control': 'must-revalidate' })

    .get('/' + db_name('a') +  '/new/att?rev=2-3b1f88c637fde74a486cf3ce5558b47e')
    .reply(200, new Buffer(pixel, 'base64'), { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
    date: 'Fri, 02 Dec 2011 16:34:30 GMT',
    'content-type': 'image/bmp',
    'content-md5': 'Ow9j2dR0Qm58Qi3z8p2w3A==',
    'content-length': '58',
    'cache-control': 'must-revalidate',
    'accept-ranges': 'bytes' });

function db(i) { return nano.use(db_name(i)); }
*/

specify("att_get:setup", timeout, function (assert) {
  nano.db.create("att_get", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("att_get:pixelAtt", timeout, function (assert) {
  var db     = nano.use("att_get")
    , buffer = new Buffer(pixel, 'base64')
    ;

    db.attachment.insert("new", "att", "Hello", "text/plain", 
    function(error, hello) {
      assert.equal(error, undefined, "Should store hello");
      assert.equal(hello.ok, true, "Response should be ok");
      assert.ok(hello.rev, "Should have a revision number");
      db.attachment.insert("new", "att", buffer, "image/bmp", 
      { rev: hello.rev }, function (error, bmp) {
        assert.equal(error, undefined, "Should store the pixel");
        db.attachment.get("new", "att", {rev: bmp.rev}, 
        function (error, bmp) {
          assert.equal(error, undefined, "Should get the pixel");
          assert.equal(bmp.toString("base64"), pixel, "Base64 is reflexive");
        });
      });
    });

});

specify("att_get:teardown", timeout, function (assert) {
  nano.db.destroy("att_get", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));