'use strict';

var compactDatabase = require('../../helpers/unit').unit([
  'database',
  'compact'
]);

compactDatabase('mock', {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'POST',
  uri: '/mock/_compact'
});
