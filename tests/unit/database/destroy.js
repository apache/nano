'use strict';

var destroyDatabase = require('../../helpers/unit').unit([
  'database',
  'destroy'
]);

destroyDatabase('mock', {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'DELETE',
  uri: '/mock'
});
