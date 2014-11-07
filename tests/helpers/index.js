'use strict';

var path = require('path');
var fs = require('fs');
var url = require('url');
var nano = require('../../lib/nano');

var helpers = exports;
var cfg = helpers.cfg = require('../fixtures/cfg');
var auth = url.parse(cfg.admin).auth.split(':');

helpers.noopTest = function(t){ t.end(); };
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
    path.join(__dirname, '..', 'fixtures', filename), (json ? 'ascii' : null));
  return json ? JSON.parse(contents) : contents;
};

