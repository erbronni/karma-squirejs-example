Mocking Module Dependencies with Squire.js and Karma
==========================
This is a simple project that demonstrates how to use [Squire.js](https://github.com/iammerrick/Squire.js/) with 
[Karma](http://karma-runner.github.io/) to mock AMD module dependencies.

TL;DR
-----
To install Squire use ```bower install squire --save-dev``` or ```npm install squirejs --save-dev```.  Then you can use
Squire to mock module dependencies by creating an ```injector```, calling ```mock``` with the modules to mock, and then 
```require``` to load the module under test.  Make sure to invoke the ```done``` function since the call to ```require```
is asynchronous.
```
define(['Squire'], function (Squire) {
  describe('Chat widget specification', function () {
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
});
```
The ```test-main.js``` file also needs to be modified.  When Squire.js invokes ```require``` to create a new context, the
```require.config``` is loaded, which causes the ```callback``` to be invoked multiple times.  So the ```callback```
needs to be modified so that it only starts up Karma once.
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
Overview
--------
The project consists of a simple JavaScript file, [chat.js](src/chat.js), that is tested by the [chatSpec.js](spec/chatSpec.js) file.  The code
uses [postal.js](https://github.com/postaljs/postal.js) to subscribe to a public and private channel.  That all the implementation does to 
 keep the focus on setting up [Squire.js](https://github.com/iammerrick/Squire.js/) to run with [Karma](http://karma-runner.github.io).  

Running the tests
----------------
To run the unit tests in this project, run the following commands. Karma is configured to run with Chrome.  If you need to change to a different
browser, make sure to install the launch via ```npm``` and update the ```karma.conf.js``` file.
```
npm install
bower install
npm run-script karma
```

Writing tests with Squire.js
----------------------------
The [chat.js](js/chat.js) script subscribes to a public and private channel through [postal.js](https://github.com/postaljs/postal.js). 
The test specification will confirm that both these subscription calls are made by creating a mock postal module and then confirming
the ```subscribe``` function is invoked with the correct parameters.  Here is a break down of [chaSpec.js](spec/chatSpec.js) file.

The first thing to do is get a refernce to the Squire module in the ```define``` block of the test.  Then ```describe``` and ```it``` 
are used to create the test suite and the individual tests.  
```
define(['Squire'], function (Squire) { 
  describe('Chat test spec', function () {
    it('Should export chat module', function (done) { /* ... */ });
    it('Should subscribe to the public channel', function (done) { /* ... */});
    it('Should subscribe to the private channel', function (done) { /* ... */});
  });
});
```
Each of the test callbacks passed into the ```it``` function takes the ```done``` parameters.  Jasmine uses the argument length to 
determine whether the test is asynchronous or not.  Since all the tests using Squire.js will be asynchrnous, the ```done``` paramter 
must be defined on the function call.

Below is once of the tests from [chatSpec.js](spec/chatSpec.js) that will be used to outline how to use [Squire.js](https://github.com/iammerrick/Squire.js/):
```
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
```
The ```Squire``` reference is a constructor.  Use it to create a new ```injector``` reference.  The ```injector``` 
creates a new require context behind the scenes, sandboxing the module loading.
```
var injector = new Squire(),
```
The code also creates spy object that will be usedd to mock the behavior of the ````postal``` library.
```
  postal = jasmine.createSpyObj('postal', ['subscribe']);
```
The add the mock modules to the injector using the ```mock``` function.  The mock function has two syntaxes, either
the name of the module and a reference to the mock object:
```
injector.mock('postal', postal);
```
Or pass in an object literal with the name/mock pairs:
```
injector.mock({
  postal: postal
});
```
The functions calls can be chained because the ```mock``` call returns a reference to itself.  After setting the mocks, the test calls
 ```require``` to load up the modules.  Then in the callback to the ```require``` call, verify the correct calls have been made:
```
injector.require(['chat'], function (chat) { 
    expect(postal.subscribe).toHaveBeenCalledWith({
      channel: 'public',
      topic: '#',
      callback: chat.publicHandler
    });
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
