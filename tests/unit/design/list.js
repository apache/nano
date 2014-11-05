'use strict';

var listDesign = require('../../helpers/unit').unit([
  'view',
  'viewWithList'
]);

listDesign('people', 'by_name_and_city', 'my_list', {
    key: [
      'Derek',
      'San Francisco'
    ]
  }, {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'GET',
  qs: {
    'key': '["Derek","San Francisco"]'
  },
  uri: '/mock/_design/people/_list/my_list/by_name_and_city'
});
