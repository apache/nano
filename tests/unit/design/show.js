'use strict';

var showDesign = require('../../helpers/unit').unit([
  'view',
  'show'
]);

showDesign('people', 'singleDoc', 'p_clemens', {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  uri: '/mock/_design/people/_show/singleDoc/p_clemens'
});
