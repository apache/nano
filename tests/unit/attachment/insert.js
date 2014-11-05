'use strict';

var helpers = require('../../helpers/unit');
var insertAttachment = helpers.unit(['attachment', 'insert']);

var buffer = new Buffer(helpers.pixel, 'base64');

insertAttachment('pixels', 'pixel.bmp', buffer, 'image/bmp', {
  body: buffer,
  headers: {
    'content-type': 'image/bmp'
  },
  method: 'PUT',
  uri: '/mock/pixels/pixel.bmp'
});

insertAttachment('pixels', 'meta.txt', 'brown', 'text/plain', {
  body: 'brown',
  headers: {
    'content-type': 'text/plain'
  },
  method: 'PUT',
  uri: '/mock/pixels/meta.txt'
});

insertAttachment('pixels', 'meta.txt', 'white', 'text/plain', {rev: '2'}, {
  body: 'white',
  headers: {
    'content-type': 'text/plain'
  },
  method: 'PUT',
  uri: '/mock/pixels/meta.txt',
  qs: {rev: '2'}
});
