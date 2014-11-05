'use strict';

var getAttachment = require('../../helpers/unit').unit([
  'attachment',
  'get'
]);

getAttachment('airplane-design', 'wings.pdf', {rev: 'rev-3'}, {
  encoding: null,
  headers: {},
  method: 'GET',
  qs: {rev: 'rev-3'},
  uri: '/mock/airplane-design/wings.pdf'
});

getAttachment('airplane-design', 'wings.pdf', {
  encoding: null,
  headers: {},
  method: 'GET',
  uri: '/mock/airplane-design/wings.pdf'
});
