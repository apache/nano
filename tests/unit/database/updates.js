'use strict';

var updatesDatabase = require('../../helpers/unit').unit([
  'database',
  'updates'
]);

updatesDatabase({
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  uri: '/_db_updates'
});

updatesDatabase({since: 1}, {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  qs: {since: 1},
  uri: '/_db_updates'
});
