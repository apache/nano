var specify  = require('specify')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , Nano     = helpers.Nano
  , nock     = helpers.nock
  , couch    = helpers.couch
  ;

var mock = nock(helpers.couch, "shared/config");

specify("shared_config:root", timeout, function (assert) {
  nano.dinosaur('', function (err, response) {
    assert.equal(err, undefined, "Failed to get root");
    assert.ok(response.version, "Version is defined");
  });
  nano.relax(function (err, response) {
    assert.equal(err, undefined, "Failed to get root");
    assert.ok(response.version, "Version is defined");
  });
});

specify("shared_config:url_parsing", timeout, function (assert) {
  var base_url = 'http://someurl.com';

  assert.equal(Nano(base_url).config.url, base_url, "Simple URL failed");
  assert.equal(
    Nano(base_url+'/').config.url, base_url+'/', "Simple URL with / failed");
  assert.equal(
    Nano('http://a:b@someurl.com:5984').config.url,
    'http://a:b@someurl.com:5984', "Auth failed");
  assert.equal(
    Nano(base_url+':5984/a').config.url, base_url+':5984',
    "Port failed");
  assert.equal(
    Nano(base_url+'/a').config.url, base_url, "Simple db failed");
});

specify("shared_config:default_headers", timeout, function (assert) {
  var nanoWithDefaultHeaders = Nano(
  { url: couch
  , default_headers:
    { 'x-custom-header': 'custom'
    , 'x-second-header': 'second'
    }
  });

  var req = nanoWithDefaultHeaders.db.list(function(err) {
    assert.equal(err, undefined, 'Error when using custom headers');
  });

  assert.equal(
    req.headers['x-custom-header']
  , 'custom'
  , 'Custom headers "x-second-header" not honored');
  assert.equal(
    req.headers['x-second-header']
  , 'second'
  , 'Custom headers "x-second-header" not honored');
});

specify.run(process.argv.slice(2));