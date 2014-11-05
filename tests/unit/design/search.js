'use strict';

var searchDesign = require('../../helpers/unit').unit([
  'view',
  'search'
]);

searchDesign('alice', 'by_id', {
  keys: 'dawg'
}, {
  body: '{"keys":"dawg"}',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'POST',
  uri: '/mock/_design/alice/_search/by_id'
});
