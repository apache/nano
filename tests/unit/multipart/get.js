'use strict';

var getMultipart = require('../../helpers/unit').unit([
  'multipart',
  'get'
]);

getMultipart('space', {extra: 'stuff'}, {
  encoding: null,
  headers: {'content-type': 'multipart/related'},
  method: 'GET',
  qs: {attachments: true, extra: 'stuff'},
  uri: '/mock/space'
});
