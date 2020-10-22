# Testing your code

This section of the documentation runs through how you might go about testing your Sails application.  There are countless test frameworks and assertion libraries for Sails and Node.js; pick one that fits your needs.

> There is no official strategy for testing in the Sails framework, and this page is a collaborative, community-driven guide that has not been thoroughly vetted by Sails core team members.  If you run across something that seems confusing or incorrect, feel free to submit a pull request.

### Preparation

For our example test suite, we'll use [mocha](http://mochajs.org/).

```bash
npm install mocha --save-dev
```

Before you start building your test cases, organize your `test/` directory structure.  Once again, when it comes to automated testing, there are several different organizational approaches you might choose.  For this example, we'll go about it as follows:

```bash
./myApp
├── api/
├── assets/
├── ...
├── test/
│  ├── integration/
│  │  ├── controllers/
│  │  │  └── UserController.test.js
│  │  ├── models/
│  │  │  └── User.test.js
│  │  └── helpers/
|  |     └── ...
│  ├── fixtures/
|  │  └── ...
│  ├── lifecycle.test.js
│  └── mocha.opts
├── ...
└── views/

```

##### lifecycle.test.js

This file is useful when you want to execute some code before and after running your tests (e.g. lifting and lowering your Sails application). Since your models are converted to Waterline collections on lift, it is necessary to lift your Sails app before trying to test them (this applies controllers and other parts of your app, too, so be sure to call this file first).

```javascript
var sails = require('sails');

// Before running any tests...
before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
  this.timeout(5000);

  sails.lift({
    // Your Sails app's configuration files will be loaded automatically,
    // but you can also specify any other special overrides here for testing purposes.

    // For example, we might want to skip the Grunt hook,
    // and disable all logs except errors and warnings:
    hooks: { grunt: false },
    log: { level: 'warn' },

  }, function(err) {
    if (err) { return done(err); }

    // here you can load fixtures, etc.
    // (for example, you might want to create some records in the database)

    return done();
  });
});

// After all tests have finished...
after(function(done) {

  // here you can clear fixtures, etc.
  // (e.g. you might want to destroy the records you created above)

  sails.lower(done);

});
```

##### mocha.opts

This file is optional.  You can use it as an alternative to command-line options for specifying [custom Mocha configuration](https://mochajs.org/#mochaopts).

One notable customization option is timeout. The default timeout in Mocha is 2 seconds, which is sufficient for most test cases but may be too short depending on how often your tests are lifting and lowering Sails. To ensure that Sails lifts in time to finish your first test, you may need to increase the timeout value in mocha.opts:

```bash
--timeout 10000
```

> **Note**: If you are writing your tests in a transpiled language such as CoffeeScript (`.coffee` files instead of `.js` files), you'll need to take an extra step to configure Mocha accordingly.  For example, you might add these lines to your `mocha.opts`:
>
> ```bash
> --require coffee-script/register
> --compilers coffee:coffee-script/register
> ```
>
> _If you prefer Typescript, the approach is basically the same, except you'll want to use `--require ts-node/register`.


### Writing tests

Once you have prepared your directory, you can start writing your integration tests:

```js
// ./test/integration/models/User.test.js

var util = require('util');

describe('User (model)', function() {

  describe('#findBestStudents()', function() {
    it('should return 5 users', function (done) {
      User.findBestStudents()
      .then(function(bestStudents) {

        if (bestStudents.length !== 5) {
          return done(new Error(
            'Should return exactly 5 students -- the students '+
            'from our test fixtures who are considered the "best".  '+
            'But instead, got: '+util.inspect(bestStudents, {depth:null})+''
          ));
        }//-•

        return done();

      })
      .catch(done);
    });
  });

});
```



### Testing actions & controllers

The most fundamental tests for your backend code involve sending an HTTP request and checking the response.  There are numerous ways to go about this, whether it's a full-fledged testing tool, like Supertest, or a pure utility like [`request`](https://npmjs.com/package/request) or [`mp-http`](https://npmjs.com/package/machinepack-http), combined with [`assert`](https://nodejs.org/dist/latest/docs/api/assert.html).

##### Using Supertest

Let's take [Supertest](https://github.com/visionmedia/supertest) for a spin:

```bash
npm install supertest --save-dev
```

The idea behind Supertest is to provide a high-level tool that helps build a specific type of test&mdash;specifically, the type of test that send an HTTP request to your Sails app and checks the response.

```js
// test/integration/controllers/UserController.test.js
var supertest = require('supertest');

describe('UserController.login', function() {

  describe('#login()', function() {
    it('should redirect to /my/page', function (done) {
      supertest(sails.hooks.http.app)
      .post('/users/login')
      .send({ name: 'test', password: 'test' })
      .expect(302)
      .expect('location','/my/page', done);
    });
  });

});
```


### Running tests

In order to run your test using Mocha, you'll have to use `mocha` in the command line then pass as arguments any test you want to run. Be sure to call lifecycle.test.js before the rest of your tests, like this: `mocha test/lifecycle.test.js test/integration/**/*.test.js`

##### Using `npm test` to run your test

You can modify your package.json file to use `npm test` instead of Mocha, and thus avoid typing out the Mocha command described above. This is particularly useful when calling lifecycle.test.js. 

On the scripts dictionary, add a `test` key and use the following as its value: `mocha test/lifecycle.test.js test/integration/**/*.test.js`. This looks like:

```json
  "scripts": {
    "start": "node app.js",
    "debug": "node debug app.js",
    "test": "node ./node_modules/mocha/bin/mocha test/lifecycle.test.js test/integration/**/*.test.js"
  }
```
The `*` is a wildcard used to match any file inside the `integration/` folder that ends in `.test.js`. If it suits you, you can modify it to search for `*.spec.js` instead. In the same way, you can use wildcards for your folders by using two `*` instead of one.

> As of Sails v1, Sails apps are generated with a `test` script already in their package.json file, but you'll still want to make some modifications to it for this example.  If you're upgrading an existing app, you may have to add a `test` key by hand.


### Continuous integration

If you'd like to have a system automatically run your tests every time you push to your source code repository, you're in luck!  Many different continuous integration systems support Sails/Node.js, so you can have your pick.  Here are a few popular choices to get you started:

+ [Circle CI](https://circleci.com/)
+ [Travis CI](http://travis-ci.com)
+ [Semaphore CI](https://semaphoreci.com/)
+ [Appveyor](http://appveyor.com)  _(useful if you'll be deploying to a Windows server)_

> All of the options above charge a monthly fee for proprietary apps but are free for open source.  Circle CI is free for proprietary apps as well, but throttled to two builds at a time. Semaphore is also free and and allows you 4x parallel CI/CD jobs.


### Load testing

A [number of commercial options](http://www.bing.com/search?q=load+testing) exist for load testing web applications.  You can also get a reasonable idea of how your app will perform using tools like [`ab`](http://httpd.apache.org/docs/2.4/programs/ab.html) or [JMeter](http://jmeter.apache.org/).  Just remember, the goal is to simulate real traffic.  For more help setting up your Sails app to be production-ready and scalable, see [Scalability](https://sailsjs.com/documentation/concepts/deployment/scaling).  For additional help or more specific questions, click [here](https://sailsjs.com/support).


### Optimizing performance

Usually, the scalability and overall performance of your app is more important than the performance and latency of any given individual request to a particular endpoint.  So rather than focusing on one piece of code in isolation, we recommend starting with [the basics](https://sailsjs.com/documentation/concepts/deployment/scaling); for most apps, that's good enough.  For some use cases (e.g. serving ads, or apps with very computationally-intensive functionality), though, individual request latency may be important from the get-go.

For testing the performance of particular chunks of code, or for benchmarking the latency of individual requests to particular endpoints, a great option is [benchmark.js](https://www.npmjs.com/package/benchmark).  Not only is it a robust library that supports high-resolution timers and returns statistically significant results, it also works great with Mocha out of the box.


<docmeta name="displayName" value="Testing">
