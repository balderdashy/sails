var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');

describe('CORS and CSRF ::', function() {

  var appName = 'testApp';

  beforeEach(function(done) {
    appHelper.lift({
      silly: false
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

    describe('with "allRoutes: true" and origin "*"', function () {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': true};");
        var routeConfig = {
          'GET /test/find': {controller: 'TestController', action: 'find', cors: false},
          'GET /test/update': {controller: 'TestController', action: 'update', cors: 'http://www.example.com'},
          'PUT /test': {controller: 'TestController', action: 'update', cors: 'http://www.example.com'},
          'POST /test': {controller: 'TestController', action: 'create', cors: 'http://www.different.com'},
          'DELETE /test': {controller: 'TestController', action: 'delete', cors: false},
          'POST /test2': {controller: 'TestController', action: 'create', cors: true},
          'PUT /test2': {controller: 'TestController', action: 'update'},
          'GET /test/patch': {controller: 'TestController', action: 'update', cors: 'http://www.example.com:1338'},
          'GET /test/create': {controller: 'TestController', action: 'create', cors: 'http://www.different.com'},
          'GET /test/destroy': {controller: 'TestController', action: 'destroy', cors: {origin: 'http://www.example.com', credentials: false}}
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = " + JSON.stringify(routeConfig));
      });

      describe('an OPTIONS request with origin "http://www.example.com"', function() {

        it('for a PUT route with {cors: http://example.com} and an Access-Control-Request-Method header set to "PUT" should respond with correct Access-Control-Allow-Origin and Access-Control-Allow-Method headers', function(done) {

          httpHelper.testRoute('options', {
            url: 'test',
            headers: {
              'Access-Control-Request-Method': 'PUT',
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-methods'], 'put');
            done();
          });

        });

        it('for a POST route with {cors: http://www.different.com} with an Access-Control-Request-Method header set to "POST" should respond with blank Access-Control-Allow-Origin and correct Access-Control-Allow-Method headers', function(done) {

          httpHelper.testRoute('options', {
            url: 'test',
            headers: {
              'Access-Control-Request-Method': 'POST',
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            assert.equal(response.headers['access-control-allow-methods'], 'post');
            done();
          });

        });

        it('for a DELETE route with {cors: false} and an Access-Control-Request-Method header set to "DELETE" should respond with correct Access-Control-Allow-Origin and Access-Control-Allow-Method headers', function(done) {

          httpHelper.testRoute('options', {
            url: 'test',
            headers: {
              'Access-Control-Request-Method': 'DELETE',
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            assert.equal(response.headers['access-control-allow-methods'], '');
            done();
          });

        });

        it('for a POST route with {cors: true} and an Access-Control-Request-Method header set to "POST" should respond with correct Access-Control-Allow-Origin and Access-Control-Allow-Method headers', function(done) {

          httpHelper.testRoute('options', {
            url: 'test/2',
            headers: {
              'Access-Control-Request-Method': 'POST',
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-methods'].toLowerCase(), 'get, post, put, delete, options, head');
            done();
          });

        });

        it('for a PUT route with no CORS settings and an Access-Control-Request-Method header set to "PUT" should respond with correct Access-Control-Allow-Origin and Access-Control-Allow-Method headers', function(done) {

          httpHelper.testRoute('options', {
            url: 'test/2',
            headers: {
              'Access-Control-Request-Method': 'PUT',
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-methods'].toLowerCase(), 'get, post, put, delete, options, head');
            done();
          });

        });

      });

      describe('a GET request with origin "http://www.example.com"', function() {

        it('to a route without a CORS config should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route configured with {cors: false} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/find',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

        it('to a route with config {cors: "http://www.example.com"} should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/update',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route with config {cors: "http://www.example.com:1338"} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/patch',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

        it('to a route with config {cors: {origin: "http://www.example.com"}} should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/destroy',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route with config {cors: "http://www.different.com"} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/create',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

      });

      describe('a request with origin "http://www.example.com:1338"', function() {

        it('to a route with config {cors: "http://www.example.com:1338"} should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/patch',
            headers: {
              'Origin': 'http://www.example.com:1338'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com:1338');
            done();
          });
        });

        it('to a route with config {cors: "http://www.example.com"} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/update',
            headers: {
              'Origin': 'http://www.example.com:1338'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

      });

      describe('a request with the same origin as the server (http://localhost:1342)"', function() {

        it('to a route with config {cors: "http://www.example.com:1338"} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/patch',
            headers: {
              'Origin': 'http://localhost:1342'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

        it('to a route with config {cors: "http://www.example.com"} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/update',
            headers: {
              'Origin': 'http://localhost:1342'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

      });


    });


    describe('with "allRoutes: false" and origin "*"', function () {

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

      describe('a request with origin "http://www.example.com"', function() {

        it('to a route with no CORS should result in a 200 response with a blank Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

        it('to a route with {cors: true} should result in a 200 response and a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/find',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route with config {cors: "http://www.example.com"} should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/update',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route with config {cors: {origin: "http://www.example.com"}} should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/destroy',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route with config {cors: "http://www.different.com"} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/create',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });
      });

      it('a request with no origin header to a route with no CORS should return successfully', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.statusCode, 200);
          done();
        });
      });

      it('a request with a non-http origin header to a route with no CORS should return successfully', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Origin': 'chrome-extension://abc123'
          },

        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.statusCode, 200);
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

        it('to a route without a CORS config should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route configured with {cors: false} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/find',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

        it('to a route with config {cors: "http://www.example.com"} should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/update',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            done();
          });
        });

        it('to a route with config {cors: "http://www.different.com"} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/create',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

      });

      describe('with origin "http://www.different.com"', function() {

        it('to a route without a CORS config should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test',
            headers: {
              'Origin': 'http://www.different.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

        it('to a route with config {cors: "http://www.different.com"} should result in a 200 response with a correct Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/create',
            headers: {
              'Origin': 'http://www.different.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.different.com');
            done();
          });
        });

        it('to a route with config {cors: {origin: "http://www.example.com"}} should result in a 200 response with an empty Access-Control-Allow-Origin header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/destroy',
            headers: {
              'Origin': 'http://www.different.com'
            },
          }, function(err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.statusCode, 200);
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

      it('to a route without a CORS config should result in a 200 response with an Access-Control-Allow-Credentials header with value "true"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.statusCode, 200);
          assert.equal(response.headers['access-control-allow-credentials'], 'true');
          done();
        });
      });

      it('to a route with {cors: {credentials: false}} should result in a 200 response with an Access-Control-Allow-Credentials header with value "false"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/destroy',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.statusCode, 200);
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

      it('to a route without a CORS config should result in a 200 response with an Access-Control-Allow-Credentials header with value "false"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.statusCode, 200);
          assert.equal(response.headers['access-control-allow-credentials'], 'false');
          done();
        });
      });

      it('to a route with {cors: {credentials: true}} should result in a 200 response with an Access-Control-Allow-Credentials header with value "true"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/destroy',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert.equal(response.statusCode, 200);
          assert.equal(response.headers['access-control-allow-credentials'], 'true');
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

      it("a POST request without a CSRF token should result in a 403 response", function (done) {

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
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': 'http://www.example.com,http://www.someplace.com,http://www.different.com', 'allRoutes': true, 'credentials': false};");
        done();
      });
    });

    after(function() {
      // console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
      process.chdir('../');
      // console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
      appHelper.teardown();
    });

    describe("with CSRF set to true (no origin set)", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = true;");
      });

      it("a request to /csrfToken should result in a 200 response and a null token", function(done) {
        httpHelper.testRoute("get", {
            url: 'csrfToken',
            headers: {
              origin: "http://www.example.com"
            }
          }, function (err, response) {
          if (err) return done(new Error(err));
          assert(response.statusCode == 200);
          assert(JSON.parse(response.body)._csrf === null, response.body);
          done();
        });
      });

    });

    describe("with CSRF set to {origin: 'http://www.example.com,http://www.someplace.com', credentials: false}", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': false, 'credentials': false};");
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = {origin: 'http://www.example.com,http://www.someplace.com'};");
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = {\"/viewtest/csrf\":{\"cors\":true}}");
      });

      describe("when the request origin header is 'http://www.example.com'", function() {

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

        it("a request to /csrfToken should respond with a _csrf token", function(done) {
          httpHelper.testRoute("get", {
              url: 'csrfToken',
              headers: {
                origin: "http://www.example.com"
              }
            }, function (err, response) {
            if (err) return done(new Error(err));
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-credentials'], 'true');
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

        it("a request to /csrfToken should respond with a _csrf token", function(done) {
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

        it("a request to /csrfToken should result in a 200 response and a null token", function(done) {
          httpHelper.testRoute("get", {
              url: 'csrfToken',
              headers: {
                origin: "http://www.different.com"
              }
            }, function (err, response) {
            if (err) return done(new Error(err));
            assert(JSON.parse(response.body)._csrf === null, response.body);
            assert(response.statusCode == 200);
            done();
          });
        });

      });

      describe("when the request origin header is 'chrome-extension://postman'", function() {

        it("a CSRF token should be present in view locals", function(done) {
          httpHelper.testRoute("get", {
              url: 'viewtest/csrf',
              headers: {
                origin: "chrome-extension://postman"
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
                origin: "chrome-extension://postman"
              }
            }, function (err, response) {
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

      });

      describe("when the request is from the same origin (http://localhost:1342)", function() {

        it("a CSRF token should be present in view locals", function(done) {
          httpHelper.testRoute("get", {
              url: 'viewtest/csrf',
              headers: {
                origin: "http://localhost:1342"
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
                origin: "http://localhost:1342"
              }
            }, function (err, response) {
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

      });


    });

  });

});
