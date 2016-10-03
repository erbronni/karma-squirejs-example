/**
 * @fileoverview RequireJS configuration.  Sets the paths for the bower dependencies.
 */
(function () {

  'use strict';

  require.config({
    paths: {
      postal: '../bower_components/postal.js/lib/postal',
      lodash: '../bower_components/lodash/dist/lodash',
      'es6-shim': '../bower_components/es6-shim/es6-shim'
    }
  });

})();
