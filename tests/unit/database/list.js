'use strict';

var listDatabases = require('../../helpers/unit').unit([
  'database',
  'list'
]);

listDatabases({
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  uri: '/_all_dbs'
});
