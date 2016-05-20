// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var db = harness.locals.db;
var it = harness.it;

it('should handle crazy encodings', function(assert) {
  var att = {
    name: 'att',
    data: 'काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥',
    'content_type': 'text/plain'
  };
  db.multipart.insert({'foo': 'bar'}, [att], 'foobar', function(error, foo) {
    assert.equal(error, null, 'should have stored foo and attachment');
    assert.equal(foo.ok, true, 'response should be ok');
    assert.ok(foo.rev, 'response should have rev');
    assert.end();
  });
});

it('should test with presence of attachment', function(assert) {
  var att = {
    name: 'two',
    data: 'Hello World!',
    'content_type': 'text/plain'
  };

  db.attachment.insert('mydoc', 'one', 'Hello World!', 'text/plain',
  function(err) {
    assert.equal(err, null, 'should have stored the thingy');
    db.get('mydoc', function(_, doc) {
      db.multipart.insert(doc, [att], 'mydoc', function() {
        db.get('mydoc', function(error, two) {
          assert.equal(error, null, 'should get the doc');
          assert.equal(Object.keys(two._attachments).length, 2,
            'both attachments should be present');
          assert.end();
        });
      });
    });
  });
});

it('should work with attachment as a buffer', function(assert) {
  var att = {
    name: 'att',
    data: new Buffer('foo'),
    'content_type': 'text/plain'
  };
  db.multipart.insert({'foo': 'bar'}, [att], 'otherdoc', function(error, foo) {
    assert.equal(error, null, 'Should have stored foo and attachment');
    assert.equal(foo.ok, true, 'Response should be ok');
    assert.ok(foo.rev, 'Response should have rev');
    assert.end();
  });
});

it('should work with attachment as a stream, when length is specified', function (assert) {
  var Readable = require('stream').Readable;
  var rs = Readable();

  var c = 'a'.charCodeAt(0);
  rs._read = function () {
      // this stream emits alphabet (abcde...xyz) one character at a time
      // stolen from: https://github.com/substack/stream-handbook
      rs.push(String.fromCharCode(c++));
      if (c > 'z'.charCodeAt(0)) rs.push(null);
  };

  var att = {
    name: 'att',
    data: rs,
    length: 26, // 'z'.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
    'content_type': 'text/plain'
  };

  db.multipart.insert({'foo': 'bar'}, [att], 'otherdoc', function(error, foo) {
    assert.equal(error, null, 'Should have stored foo and attachment');
    assert.equal(foo.ok, true, 'Response should be ok');
    assert.ok(foo.rev, 'Response should have rev');
    assert.end();
  });
});

// TODO it('should fail early with attachment as a stream, when length is NOT specified')
