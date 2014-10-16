'use strict';

var path = require('path');
var fs = require('fs');
var url = require('url');
var harness = require('tape-it');
var debug = require('debug');
var path = require('path');
var endsWith = require('endswith');
var cfg = require('./fixtures/cfg');
var nano = require('../nano');
var helpers = exports;

var auth = url.parse(cfg.admin).auth.split(':');

helpers.timeout = cfg.timeout;
helpers.nano = nano(cfg.couch);
helpers.Nano = nano;
helpers.couch = cfg.couch;
helpers.admin = cfg.admin;
helpers.pixel = 'Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAA' +
  'AAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA==';

helpers.username = auth[0];
helpers.password = auth[1];

helpers.loadFixture = function helpersLoadFixture(filename, json) {
  var contents = fs.readFileSync(
    path.join(__dirname, 'fixtures', filename), (json ? 'ascii' : null));
  return json ? JSON.parse(contents) : contents;
};

helpers.setup = function() {
  var self = this;
  var args = Array.prototype.slice.call(arguments);

  return function(assert) {
    args.push(function(err) {
      assert.equal(err, null, 'create database');
      assert.end();
    });

    self.nano.db.create.apply(this, args);
  };
};

helpers.teardown = function() {
  var self = this;
  var args = Array.prototype.slice.call(arguments);

  return function(assert) {
    args.push(function(err) {
      assert.equal(err, null, 'destroy database');
      assert.ok(self.mock.isDone(), 'mocks didn\'t run');
      assert.end();
    });

    self.nano.db.destroy.apply(this, args);
  };
};

helpers.harness = function(opts) {
  opts = opts || {};
  var fileName   = path.basename(module.parent.filename).split('.')[0];
  var parentDir    = path.dirname(module.parent.filename)
      .split(path.sep).reverse()[0];
  var shortPath    = path.join(parentDir, fileName);
  var log = debug(path.join('tests', shortPath));
  var dbName       = shortPath.replace('/', '_');
  var nanoLog = nano({
    url: cfg.couch,
    log: log
  });
  var mock = helpers.nock(helpers.couch, shortPath, log);
  var db   = nanoLog.use(dbName);
  var locals = {
    mock: mock,
    db: db,
    nano: nanoLog
  };

  return harness({
    id: shortPath,
    timeout: helpers.timeout,
    checkLeaks: false,
    locals: locals,
    setup: helpers.setup.call(locals, dbName),
    teardown: helpers.teardown.call(locals, dbName)
  });
};

helpers.nock = function helpersNock(url, fixture, log) {
  var nock = require('nock');
  var nockDefs = require('./fixtures/' + fixture + '.json');

  nockDefs.forEach(function(n) {
    var headers = n.headers || {};
    var response = n.buffer ? endsWith(n.buffer, '.png') ?
        helpers.loadFixture(n.buffer) : new Buffer(n.buffer, 'base64') :
        n.response || '';
    var body = n.base64 ? new Buffer(n.base64, 'base64').toString() :
        n.body || '';

    if (typeof headers === 'string' && endsWith(headers, '.json')) {
      headers = require(path.join(fixture, headers));
    }

    n.method = n.method || 'get';
    n.options = {log: log};
    n.scope = url;
    n.headers = headers;
    n.response = response;
    n.body = body;

    return n;
  });

  nock.define(nockDefs);

  return nock(url);
};
