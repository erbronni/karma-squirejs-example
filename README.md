Mocking Module Dependencies with Squire.js and Karma
==========================
[Karma](http://karma-runner.github.io/) is a great test runner that has support for [RequireJS](http://requirejs.org). 
When running with the [karam-requirejs](https://github.com/karma-runner/karma-requirejs) plugin, karma will use require
to load the modules and the tests, leveraging the existing module architecture.  While this is all great, there are 
some drawbacks, as how do you mock out a module dependency from the tests.  Luckily, there is a library, 
[Squire.js](https://github.com/iammerrick/Squire.js/), that solves that exact problem, mocking out module dependencies. 
This project provides a full, but simple, example of using [Karma](http://karma-runner.github.io/), 
[Jasmine](https://jasmine.github.io), [RequireJS](http://www.requirejs.org), and 
[Squire.js](https://github.com/iammerrick/Squire.js/) together to write unit tests.

TL;DR
-----
To install Squire use ```bower install squire --save-dev``` or ```npm install squirejs --save-dev```.  Then you can use
Squire to mock module dependencies by creating an ```injector```, calling ```mock``` with the modules to mock, and then 
```require``` to load the module under test.  Note since ```require``` takes a callback, the test is asynchronous, so 
the ```done``` function must be invoked, otherwise Jasmine won't be able to process the test results correctly.
```
define(['Squire'], function (Squire) {
    it('Should subscribe to the public channel', function (done) {
      var injector = new Squire(),
        postal = jasmine.createSpyObj('postal', ['subscribe']);

      injector.mock({
        postal: postal
      }).require(['chat'], function (chat) {
        expect(postal.subscribe).toHaveBeenCalledWith({
          channel: 'public',
          topic: '#',
          callback: chat.publicHandler
        });
        done();
      });
    });
});
```
If you just start using [Squire.js](https://github.com/iammerrick/Squire.js/) in your test, you might have noticed some 
strange behavior, as the number of tests run by Karma seems to grow exponentially.  This is because Squire is creating a
new context every time it invokes ```require```.  The separate context allows Squire to create a sandbox to 
isolate the module dependencies and injects the mock modules.  Unfortunately, every time a context is created, the 
callback on the require configuration is invoked, calling ```__karma__.start```. 

If you want to jump right to the solution, the test-main.js below will ensure that karma is started only once.  The 
 require.js ```callback``` is set to the ```startKarma``` function .  The ```runOnce``` flag is used by the 
 ```startKarma``` function to ensure ```__karma__.start``` is only executed only once.  This prevents karma from 
 starting up again every time Squire is invoked.
```
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
```

Getting started with the project
=============
This project contains 

```
npm install
bower install
npm run-script karma
```

Why would I need to mock a module dependency?
---------------------------------------------
When the code under test calls a module during its initialization, the test code won't have a chance to spy on the 
invocation if it waits until after the module has loaded.  By creating a mock module and having the code under test 
initialize with the mock module, the test code gets a chance to intercept and record the invocation.

In this ```chat.js``` modules, the script subscribes to two messaging channels when it is loaded.  To confirm that 
 these calls are made, the test framework will need to monitor the calls to the ```postal``` module 

```
define('chat', ['postal'], function (postal) {

  'use strict';

  /**
   * Centralized event handler for application.
   * @exports chat
   */
  var chat = {
    /**
     * Postal channel.
     */
    CHANNEL: 'public',

    /**
     * Handler for public messages.
     */
    publicHandler: function () {
      console.log('INVOKED PUBLIC HANDLER');
    },

    /**
     * Handler for private messages.
     * @private
     */
    _privateHandler: function () {
      console.log('INVOKED PRIVATE HANDLER');
    }

  };

  // Subscribe to the public channel.
  postal.subscribe({
    channel: chat.CHANNEL,
    topic: '#',
    callback: chat.publicHandler
  });

  // Subscribe tot he private channel
  postal.subscribe({
    channel: 'private',
    topic: '#',
    callback: chat._privateHandler
  });

  return chat;

});
```

Writing tests with Squire.js
----------------------------
The first thing to do is get a refernce to the Squire module in the ```define``` block of the test.
```
define(['Squire'], function (Squire) { });
```
The ```Squire``` reference is a constructor.  Use it to create a new ```injector``` reference.  The ```injector``` 
creates a new require context behind the scenes, sandboxing the module loading.
```
var injector = new Squire();
```
The add the mock modules to the injector using the ```mock``` function.  The mock function ahs two syntaxes, either
the name of the module and a reference to the mock object:
```
injector.mock('postal', jasmine.createSpyObj('postal', ['subscribe']);
```
Or pass in an object literal with the name/mock pairs:
```
injector.mock({
  postal: jasmine.createSpyObj('postal', ['subscribe']),
  util: jasmine.createSpyObj('util', ['promiseWrapper'])
});
```
Then call ```require``` to load up your module and perform and verify the correct calls have been made:
```
injector.require(['chat'], function (chat) { 
    expect(postal.subscribe).toHaveBeenCalled();
    done();
})
```
Remember to call ```done```.  The call to ```injector.require``` is asynchronous, so all the tests need to call the 
```done``` function.

For more information
--------------------
* [Squire.js](https://github.com/iammerrick/Squire.js/)
* [Karma](http://karma-runner.github.io)
* [Jasmine](http://jasmine.github.io)
* [Require](http://www.requirejs.org)
