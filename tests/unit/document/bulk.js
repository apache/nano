'use strict';

var bulkDocument = require('../../helpers/unit').unit([
  'document',
  'bulk'
]);

bulkDocument({
  docs: [
    {key: 'baz', name: 'bazzel'},
    {key: 'bar', name: 'barry'}
  ]
}, {
  body: '{"docs":[{"key":"baz","name":"bazzel"},{"key":"bar","name":"barry"}]}',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'POST',
  uri: '/mock/_bulk_docs'
});

bulkDocument({
  docs: []
}, {wat: 'izlove'}, {
  body: '{"docs":[]}',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'POST',
  qs: {wat: 'izlove'},
  uri: '/mock/_bulk_docs'
});
