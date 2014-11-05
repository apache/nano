'use strict';

var async = require('async');
var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

it('should insert `alice` the design doc', function(assert) {
  async.waterfall([
    function(next) {
      db.insert({
        views: {
          'by_id': {
            map: 'function(doc) { emit(doc._id, doc); }'
          }
        }
      }, '_design/alice', next);
    },
    function(data, _, next) {
      db.insert({'foo': 'baz'}, 'foobaz', next);
    },
    function(foo, _, next) {
      db.destroy('foobaz', foo.rev, next);
    }
  ], function(err) {
    assert.equal(err, null, 'it should destroy the foo');
    assert.end();
  });
});

it('should be able to compact a view', function(assert) {
  async.waterfall([
    function(next) {
      db.view.compact('alice', next);
    },
    function(response, _, next) {
      function dbInfo() {
        db.info(function(err, info) {
          if (!info['compact_running']) {
            clearInterval(task);
            next();
          }
        });
      }
      var task = setInterval(dbInfo, 50);
    },
    function(next) {
      db.view('alice', 'by_id', next);
    }
  ], function(err, view) {
    assert.equal(err, null, 'should be able to call the view');
    assert.equal(view['total_rows'], 0, 'and see stuff got deleted');
    assert.end();
  });
});
