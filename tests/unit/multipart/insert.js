'use strict';

var insertMultipart = require('../../helpers/unit').unit([
  'multipart',
  'insert'
]);

insertMultipart({hey: 1}, [{
    name: 'att',
    data: 'some',
    'content_type': 'text/plain'
  }], {extra: 'stuff'}, {
  headers: {
    'content-type': 'multipart/related'
  },
  method: 'PUT',
  multipart: [
    {
      body:
      '{"_attachments":' +
        '{"att":{"follows":true,"length":4,"content_type":"text/plain"}}' +
        ',"hey":1}',
      'content-type': 'application/json'
    },
    {body: 'some'}
  ],
  qs: {extra: 'stuff'},
  uri: '/mock'
});
