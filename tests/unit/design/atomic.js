'use strict';

var atomicDesign = require('../../helpers/unit').unit([
  'view',
  'atomic'
]);

atomicDesign('update', 'inplace', 'foobar', {
    field: 'foo',
    value: 'bar'
  }, {
  body: '{"field":"foo","value":"bar"}',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  method: 'PUT',
  uri: '/mock/_design/update/_update/inplace/foobar'
});
