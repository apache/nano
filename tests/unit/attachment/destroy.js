'use strict';

var destroyAttachment = require('../../helpers/unit').unit([
  'attachment',
  'destroy'
]);

destroyAttachment('airplane-design', 'wings.pdf', {rev: '3'}, {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'DELETE',
  qs: {rev: '3'},
  uri: '/mock/airplane-design/wings.pdf'
});
