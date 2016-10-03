(function () {

  'use strict';

  var allTestFiles = [];
  var TEST_REGEXP = /^\/base\/spec\/.*Spec\.js$/;
  var runOnce = true;
  var startKarma = function () {
    if (runOnce) {
      runOnce = false;
      window.__karma__.start.apply(window.__karma__, arguments);
    }
  };

  // Get a list of all the test files to include
  Object.keys(window.__karma__.files).forEach(function (file) {
    if (TEST_REGEXP.test(file)) {
      allTestFiles.push(file);
    }
  });

  require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/js',
    // Additional configuration
    paths: {
      Squire: '../bower_components/Squire.js/src/Squire'
    },
    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: startKarma
  });

})();
