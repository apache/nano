'use strict';

var compactDesign = require('../../helpers/unit').unit([
  'view',
  'compact'
]);

compactDesign('alice', {
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'POST',
  uri: '/mock/_compact/alice'
});
