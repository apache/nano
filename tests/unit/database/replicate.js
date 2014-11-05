'use strict';

var replicateDatabase = require('../../helpers/unit').unit([
  'database',
  'replicate'
]);

replicateDatabase('baa', 'baashep', {
  body: '{"source":"baa","target":"baashep"}',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'POST',
  uri: '/_replicate'
});

replicateDatabase('molly', 'anne', {some: 'params'}, {
  body: '{"some":"params","source":"molly","target":"anne"}',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'POST',
  uri: '/_replicate'
});
