'use strict';

var createDatabase = require('../../helpers/unit').unit([
  'database',
  'create'
]);

createDatabase('mock', {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'PUT',
  uri: '/mock'
});

createDatabase('az09_$()+-/', {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'PUT',
  uri: '/az09_%24()%2B-%2F'
});
