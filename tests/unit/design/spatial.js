'use strict';

var geoDesign = require('../../helpers/unit').unit([
  'view',
  'spatial'
]);

geoDesign('people', 'byArea', {x: '1'}, {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  qs: {x: '1'},
  uri: '/mock/_design/people/_spatial/byArea'
});
