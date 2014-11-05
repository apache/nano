'use strict';

var changesDatabase = require('../../helpers/unit').unit([
  'database',
  'changes'
]);

changesDatabase('mock', {since: '10'}, {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  qs: {since: '10'},
  uri: '/mock/_changes'
});

changesDatabase('mock', {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  uri: '/mock/_changes'
});
