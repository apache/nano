'use strict';

var async = require('async');
var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;
var viewDerek = helpers.viewDerek;

var opts = {key: ['Derek', 'San Francisco']};

it('should create a ddoc and insert some docs', helpers.prepareAView);

it('should respond with derek when asked for derek', function(assert) {
  viewDerek(db, assert, opts, assert.end);
});

it('should have no cloning issues when doing queries', function(assert) {
  async.waterfall([
    function(next) { viewDerek(db, assert, opts, next); },
    function(next) { viewDerek(db, assert, opts, next); }
  ], function(err) {
    assert.equal(err, null, 'no errors');
    assert.ok(Array.isArray(opts.key));
    assert.equal(opts.key[0], 'Derek');
    assert.equal(opts.key[1], 'San Francisco');
    assert.end();
  });
});
