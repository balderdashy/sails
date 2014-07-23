var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');

describe('CORS and CSRF ::', function() {

  var appName = 'testApp';

  beforeEach(function(done) {
    appHelper.lift({
      verbose: false
    }, function(err, sails) {
      if (err) {
        throw new Error(err);
      }
      sailsprocess = sails;
      sailsprocess.once('hook:http:listening', done);
    });
  });

  afterEach(function(done) {
    sailsprocess.kill(done);
  });

  describe('CORS config ::', function() {

    before(function(done) {
      this.timeout(5000);
      appHelper.build(done);
    });

    after(function() {
      // console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
      process.chdir('../');
      // console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
      appHelper.teardown();
    });

    describe('with "allRoutes: true" and origin "*", a request with origin "http://www.example.com"', function () {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': true};");
        var routeConfig = {
          'GET /test/find': {controller: 'TestController', action: 'find', cors: false},
          'GET /test/update': {controller: 'TestController', action: 'update', cors: 'http://www.example.com'},
          'GET /test/create': {controller: 'TestController', action: 'create', cors: 'http://www.different.com'},
          'GET /test/destroy': {controller: 'TestController', action: 'destroy', cors: {origin: 'http://www.example.com', credentials: false}}
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = " + JSON.stringify(routeConfig));
      });

      it('to a route without a CORS config should result in a correct Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
          done();
        });
      });

      it('to a route configured with {cors: false} should result in an empty Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/find',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], '');
          done();
        });
      });

      it('to a route with config {cors: "http://www.example.com"} should result in a correct Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/update',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
          done();
        });
      });

      it('to a route with config {cors: {origin: "http://www.example.com"}} should result in a correct Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/destroy',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
          done();
        });
      });

      it('to a route with config {cors: "http://www.different.com"} should result in an empty Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/create',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], '');
          done();
        });
      });
    });


    describe('with "allRoutes: false" and origin "*", a request with origin "http://www.example.com"', function () {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': false };");
        var routeConfig = {
          'GET /test/find': {controller: 'TestController', action: 'find', cors: true},
          'GET /test/update': {controller: 'TestController', action: 'update', cors: 'http://www.example.com'},
          'GET /test/create': {controller: 'TestController', action: 'create', cors: 'http://www.different.com'},
          'GET /test/destroy': {controller: 'TestController', action: 'destroy', cors: {origin: 'http://www.example.com'}}
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = " + JSON.stringify(routeConfig));
      });

      it('to a route with no CORS should result in no Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(typeof response.headers['access-control-allow-origin'], 'undefined');
          done();
        });
      });

      it('to a route with {cors: true} should result in a correct Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/find',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
          done();
        });
      });

      it('to a route with config {cors: "http://www.example.com"} should result in a correct Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/update',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
          done();
        });
      });

      it('to a route with config {cors: {origin: "http://www.example.com"}} should result in a correct Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/destroy',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
          done();
        });
      });

      it('to a route with config {cors: "http://www.different.com"} should result in an empty Access-Control-Allow-Origin header', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/create',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-origin'], '');
          done();
        });
      });

    });

    describe('with "allRoutes: true" and origin "http://www.example.com", a request', function () {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': 'http://www.example.com', 'allRoutes': true };");
        var routeConfig = {
          'GET /test/find': {controller: 'TestController', action: 'find', cors: false},
          'GET /test/update': {controller: 'TestController', action: 'update', cors: 'http://www.example.com'},
          'GET /test/create': {controller: 'TestController', action: 'create', cors: 'http://www.different.com'},
          'GET /test/destroy': {controller: 'TestController', action: 'destroy', cors: {origin: 'http://www.example.com'}}
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = " + JSON.stringify(routeConfig));
      });

      describe('with origin "http://www.example.com"', function() {

        it('to a route without a CORS config should result in a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route configured with {cors: false} should result in an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/find',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

        it('to a route with config {cors: "http://www.example.com"} should result in a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/update',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route with config {cors: "http://www.different.com"} should result in an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/create',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

      });

      describe('with origin "http://www.different.com"', function() {

        it('to a route without a CORS config should result in an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test',
            headers: {
              'Origin': 'http://www.different.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

        it('to a route with config {cors: "http://www.different.com"} should result in a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/create',
            headers: {
              'Origin': 'http://www.different.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.different.com');
            done();
          });
        });

        it('to a route with config {cors: {origin: "http://www.example.com"}} should result in an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/destroy',
            headers: {
              'Origin': 'http://www.different.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

      });

    });

    describe('with "credentials: true", a request', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': true, 'credentials': true};");
        var routeConfig = {
          'GET /test/destroy': {controller: 'TestController', action: 'destroy', cors: {origin: 'http://www.example.com', credentials: false}}
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = " + JSON.stringify(routeConfig));
      });

      it('to a route without a CORS config should result in a Access-Control-Allow-Credentials header with value "true"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-credentials'], 'true');
          done();
        });
      });

      it('to a route with {cors: {credentials: false}} should result in an Access-Control-Allow-Credentials header with value "false"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/destroy',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-credentials'], 'false');
          done();
        });
      });

    });

    describe('with "credentials: false", a request', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': true, 'credentials': false};");
        var routeConfig = {
          'GET /test/destroy': {controller: 'TestController', action: 'destroy', cors: {origin: 'http://www.example.com', credentials: true}}
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = " + JSON.stringify(routeConfig));
      });

      it('to a route without a CORS config should result in a Access-Control-Allow-Credentials header with value "false"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-credentials'], 'false');
          done();
        });
      });

      it('to a route with {cors: {credentials: true}} should result in an Access-Control-Allow-Credentials header with value "true"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/destroy',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-credentials'], 'true');
          done();
        });
      });

    });

    describe('with "methods: \'GET, POST, PUT, DELETE, OPTIONS, HEAD\'", an OPTIONS request from an allowable origin', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': true, 'methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD'};");
        var routeConfig = {
          '/test/destroy': {controller: 'TestController', action: 'destroy', cors: {methods: 'POST'}}
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = " + JSON.stringify(routeConfig));
      });

      it("to a route with no CORS config should return an Access-Control-Allow-Methods header with the default values", function (done) {

        httpHelper.testRoute('options', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-methods'], 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
          done();
        });
      });

      it("to a route with {cors: {methods: 'POST'}} should return an Access-Control-Allow-Methods header with just 'POST'", function (done) {

        httpHelper.testRoute('options', {
          url: 'test/destroy',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-methods'], 'POST');
          done();
        });
      });

    });

    describe('with "headers: \'content-type\'", an OPTIONS request from an allowable origin', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': true, 'headers': 'content-type'};");
        var routeConfig = {
          '/test/destroy': {controller: 'TestController', action: 'destroy', cors: {headers: 'content-length'}}
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = " + JSON.stringify(routeConfig));
      });

      it("to a route with no CORS config should return an Access-Control-Allow-Headers header with the default values", function (done) {

        httpHelper.testRoute('options', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-headers'], 'content-type');
          done();
        });
      });

      it("to a route with {cors: {headers: 'content-length'}} should return an Access-Control-Allow-Headers header with just 'content-length'", function (done) {

        httpHelper.testRoute('options', {
          url: 'test/destroy',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.headers['access-control-allow-headers'], 'content-length');
          done();
        });
      });

    });

  });

  describe("CSRF config ::", function () {

    before(function(done) {
      this.timeout(5000);
      appHelper.build(done);
    });

    after(function() {
      // console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
      process.chdir('../');
      // console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
      appHelper.teardown();
    });

    describe("with CSRF set to 'false'", function() {

      it("no CSRF token should be present in view locals", function(done) {
        httpHelper.testRoute("get", 'viewtest/csrf', function (err, response) {
          if (err) return done(new Error(err));
          assert(response.body.indexOf('csrf=null') !== -1, response.body);
          done();
        });
      });

      it("a request to /csrfToken should result in a 404 error", function(done) {
        httpHelper.testRoute("get", '/csrfToken', function (err, response) {
          if (err) return done(new Error(err));
          assert(response.statusCode == 404);
          done();
        });
      });

    });

    describe("with CSRF set to 'true'", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = true;");
      });

      it("a CSRF token should be present in view locals", function(done) {
        httpHelper.testRoute("get", 'viewtest/csrf', function (err, response) {
          if (err) return done(new Error(err));
          assert(response.body.match(/csrf=.+=/), response.body);
          done();
        });
      });

      it("a request to /csrfToken should respond with a _csrf token", function(done) {
        httpHelper.testRoute("get", 'csrftoken', function (err, response) {
          if (err) return done(new Error(err));
          try {
            var body = JSON.parse(response.body);
            assert(body._csrf, response.body);
            done();
          } catch (e) {
            done(new Error('Unexpected response: '+response.body));
          }
        });
      });

      it("a POST request without a CSRF token should result in a 'forbidden' response", function (done) {

        httpHelper.testRoute("post", 'user', function (err, response) {

          if (err) return done(new Error(err));
          assert.equal(response.statusCode, 403);
          done();

        });

      });

      it("a POST request with a valid CSRF token should result in a 200 response", function (done) {

        httpHelper.testRoute("get", 'csrftoken', function (err, response) {
          if (err) return done(new Error(err));
          try {
            var body = JSON.parse(response.body);
            var sid = response.headers['set-cookie'][0].split(';')[0].substr(10);
            httpHelper.testRoute("post", {
                url: 'user',
                headers: {
                  'Content-type': 'application/json',
                  'cookie': 'sails.sid='+sid
                },
                body: '{"_csrf":"'+body._csrf+'"}'
              }, function (err, response) {

              if (err) return done(new Error(err));

              assert.equal(response.statusCode, 200);
              done();

            });
          } catch (e) {
            done(e);
          }
        });

      });
    });

    describe("with CSRF set to {protectionEnabled: true, grantTokenViaAjax: false}", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = {protectionEnabled: true, grantTokenViaAjax: false};");
      });

      it("a request to /csrfToken should respond with a 404", function(done) {
        httpHelper.testRoute("get", 'csrftoken', function (err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.statusCode, 404);
          done();
        });

      });

    });

  });

  describe("CORS+CSRF ::", function () {

    before(function(done) {
      this.timeout(5000);
      appHelper.build(function() {
        // Add a CORS config that should be IGNORED by the CSRF hook, which does its own CORS handling
        // If this isn't being ignored properly, then errors should occur when requesting /csrfToken from a different origin
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': 'http://noplace.com', 'allRoutes': true, 'credentials': false};");
        done();
      });
    });

    after(function() {
      // console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
      process.chdir('../');
      // console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
      appHelper.teardown();
    });

    describe("with CSRF set to true", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = true;");
      });

      it("no CSRF token should be present in view locals", function(done) {
        httpHelper.testRoute("get", {
            url: 'viewtest/csrf',
            headers: {
              origin: "http://www.example.com"
            }
          }, function (err, response) {
          if (err) return done(new Error(err));
          assert(response.body.indexOf('csrf=null') !== -1, response.body);
          done();
        });
      });

      it("a request to /csrfToken should result in a 404 error", function(done) {
        httpHelper.testRoute("get", {
            url: '/csrfToken',
            headers: {
              origin: "http://www.example.com"
            }
          }, function (err, response) {
          if (err) return done(new Error(err));
          assert(response.statusCode == 404);
          done();
        });
      });

    });

    describe("with CSRF set to {origin: 'http://www.example.com,http://www.someplace.com'}", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = {origin: 'http://www.example.com,http://www.someplace.com'};");
      });

      describe("when the request origin header is 'http://www.example.com'", function() {

        it("a CSRF token should be present in view locals", function(done) {
          httpHelper.testRoute("get", {
              url: 'viewtest/csrf',
              headers: {
                origin: "http://www.example.com"
              }
            }, function (err, response) {
            if (err) return done(new Error(err));
            assert(response.body.match(/csrf=.+=/));
            done();
          });
        });

        it("a request to /csrfToken should respond with a _csrf token", function(done) {
          httpHelper.testRoute("get", {
              url: 'csrfToken',
              headers: {
                origin: "http://www.example.com"
              }
            }, function (err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            try {
              var body = JSON.parse(response.body);
              assert(body._csrf, response.body);
              done();
            } catch (e) {
              done(new Error('Unexpected response: '+response.body));
            }
          });
        });

      });

      describe("when the request origin header is 'http://www.someplace.com'", function() {

        it("a CSRF token should be present in view locals", function(done) {
          httpHelper.testRoute("get", {
              url: 'viewtest/csrf',
              headers: {
                origin: "http://www.someplace.com"
              }
            }, function (err, response) {
            if (err) return done(new Error(err));
            assert(response.body.match(/csrf=.+=/));
            done();
          });
        });

        it("a request to /csrfToken should respond with a _csrf roken", function(done) {
          httpHelper.testRoute("get", {
              url: 'csrfToken',
              headers: {
                origin: "http://www.someplace.com"
              }
            }, function (err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.someplace.com');
            try {
              var body = JSON.parse(response.body);
              assert(body._csrf, response.body);
              done();
            } catch (e) {
              done(new Error('Unexpected response: '+response.body));
            }
          });
        });

      });

      describe("when the request origin header is 'http://www.different.com'", function() {

        it("no CSRF token should be present in view locals", function(done) {
          httpHelper.testRoute("get", {
              url: 'viewtest/csrf',
              headers: {
                origin: "http://www.different.com"
              }
            }, function (err, response) {
            if (err) return done(new Error(err));
            assert(response.body.indexOf('csrf=null') !== -1, response.body);
            done();
          });
        });

        it("a request to /csrfToken should result in a 403 error", function(done) {
          httpHelper.testRoute("get", {
              url: 'csrfToken',
              headers: {
                origin: "http://www.different.com"
              }
            }, function (err, response) {
            if (err) return done(new Error(err));
            assert(response.statusCode == 403);
            done();
          });
        });

      });


    });

  });

});
