'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

if (helpers.unmocked) {
  it('should insert a bunch of items', helpers.insertThree);

  var feed1;

  it('should be able to get the changes feed', function(assert) {
    var i = 3;

    feed1 = db.follow({since: 3});

    feed1.on('change', function(change) {
      assert.ok(change, 'change existed');
      assert.equal(change.seq, i + 1, 'seq is set correctly');
      ++i;
      if (i === 4) {
        console.log(change, i);
        assert.end();
      }
    });

    feed1.follow();

    setTimeout(function() {
      db.insert({'bar': 'baz'}, 'barbaz');
    }, 100);
  });

  it('should see changes since `seq:3`', function(assert) {
    var feed = db.follow({since: 3}, function(error, change) {
      assert.equal(error, null, 'should not have errors');
      assert.ok(change, 'change existed');
      feed.die();
      feed1.die();
      process.nextTick(assert.end);
    });
  });
}
