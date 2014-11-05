'use strict';

var followDatabase = require('../../helpers/unit').unit([
  'database',
  'follow'
]);

followDatabase('space', {db: '/space'});
