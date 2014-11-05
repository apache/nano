'use strict';

var copyDocument = require('../../helpers/unit').unit([
  'document',
  'copy'
]);

var copyDocumentFail = require('../../helpers/unit').unit([
  'document',
  'copy'
], new Error('OMG This sucks'));

copyDocument('excel', 'numbers', {
  headers: {
    'Destination': 'numbers',
    'accept': 'application/json',
    'content-type': 'application/json'
  },
  method: 'COPY',
  uri: '/mock/excel'
});

copyDocumentFail('excel', 'numbers', {overwrite: 'yes'}, {

});
