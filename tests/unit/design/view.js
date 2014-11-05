'use strict';

var viewDesign = require('../../helpers/unit').unit([
  'view',
  'view'
]);

viewDesign('alice', 'by_id', {
  keys: ['foobar', 'barfoo'],
  'include_docs': true
}, {
  body: '{"keys":["foobar","barfoo"]}',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'POST',
  qs: {
    'include_docs': true
  },
  uri: '/mock/_design/alice/_view/by_id'
});
