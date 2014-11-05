'use strict';

var getDatabase = require('../../helpers/unit').unit([
  'database',
  'get'
]);

getDatabase('space', {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  uri: '/space'
});
