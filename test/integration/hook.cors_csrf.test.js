/**
 * Module dependencies
 */

var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');



describe('CORS and CSRF ::', function() {

  var appName = 'testApp';


  var sailsApp;
  beforeEach(function(done) {
    appHelper.lift({
      log: {
        level: 'silent'
      }
    }, function(err, sails) {
      if (err) {
        return done(err);
      }
      sailsApp = sails;
      return done();
    });
  });

  afterEach(function(done) {
    sailsApp.lower(function(err) {
      if (err) {
        return done(err);
      }
      setTimeout(done, 100);
    });
  });



  //   ██████╗ ██████╗ ██████╗ ███████╗     ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗
  //  ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
  //  ██║     ██║   ██║██████╔╝███████╗    ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
  //  ██║     ██║   ██║██╔══██╗╚════██║    ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
  //  ╚██████╗╚██████╔╝██║  ██║███████║    ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
  //   ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
  //

  describe('CORS config ::', function() {

    before(function(done) {
      appHelper.build(done);
    });

    describe('with "allRoutes: true" and origin "*"', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), 'module.exports.cors = { origin: \'*\', allRoutes: true};');
        var routeConfig = {
          'GET /test/find': {
            controller: 'TestController',
            action: 'find',
            cors: false
          },
          'GET /test/update': {
            controller: 'TestController',
            action: 'update',
            cors: 'http://www.example.com'
          },
          'GET /test2': {
            controller: 'TestController',
            action: 'find',
            cors: {
              'exposeHeaders': 'x-custom-header'
            }
          },
          'PUT /test': {
            controller: 'TestController',
            action: 'update',
            cors: 'http://www.example.com'
          },
          'POST /test': {
            controller: 'TestController',
            action: 'create',
            cors: 'http://www.different.com'
          },
          'DELETE /test': {
            controller: 'TestController',
            action: 'delete',
            cors: false
          },
          'POST /test2': {
            controller: 'TestController',
            action: 'create',
            cors: true
          },
          'OPTIONS /test2': {
            controller: 'TestController',
            action: 'index'
          },
          'PUT /test2': {
            controller: 'TestController',
            action: 'update'
          },
          'GET /test/patch': {
            controller: 'TestController',
            action: 'update',
            cors: 'http://www.example.com:1338'
          },
          'GET /test/create': {
            controller: 'TestController',
            action: 'create',
            cors: 'http://www.different.com'
          },
          'GET /test/destroy': {
            controller: 'TestController',
            action: 'destroy',
            cors: {
              origin: 'http://www.example.com',
              credentials: false
            }
          },
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + JSON.stringify(routeConfig));
      });

      describe('an OPTIONS request with origin "http://www.example.com"', function() {

        it('for a PUT route with {cors: http://example.com} and an Access-Control-Request-Method header set to "PUT" should respond with correct Access-Control-Allow-* headers', function(done) {

          httpHelper.testRoute('options', {
            url: 'test',
            headers: {
              'Access-Control-Request-Method': 'PUT',
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) {
              return done(new Error(err));
            }
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-methods'], 'put');
            assert.equal(response.headers['access-control-allow-headers'], 'content-type');
            done();
          });

        });

        it('for a route without a custom OPTIONS handler should use the default Express handler', function(done) {

          httpHelper.testRoute('options', {
            url: 'test',
          }, function(err, response) {
            if (err) {
              return done(new Error(err));
            }
            var body = response.body.split(',').sort().join(',');

            // Get the expected methods, either from Node herself (if available) or else from
            // what we know Express will get from the "methods" dependency
            var expected = (function() {
              var methods;
              if (require('http').METHODS) {
                methods = require('http').METHODS.reduce(function(memo, method) {
                  if (method.toUpperCase() !== 'OPTIONS') {
                    memo.push(method.toUpperCase());
                  }
                  return memo;
                }, []).sort().join(',');
              } else {
                methods = 'CHECKOUT,CONNECT,COPY,DELETE,GET,HEAD,LOCK,M-SEARCH,MERGE,MKACTIVITY,MKCOL,MOVE,NOTIFY,PATCH,POST,PROPFIND,PROPPATCH,PURGE,PUT,REPORT,SEARCH,SUBSCRIBE,TRACE,UNLOCK,UNSUBSCRIBE';
              }
              return methods;
            })();

            assert.equal(response.statusCode, 200);
            assert.equal(body, expected, require('util').format('\nExpected methods: %s\nActual methods:  ', expected, response.body));
            done();
          });

        });

        it('for a route with a custom OPTIONS handler should use the custom handler', function(done) {

          httpHelper.testRoute('options', {
            url: 'test2',
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.statusCode, 200);
            assert.equal(response.body, 'index');
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            assert.equal(response.headers['access-control-allow-methods'], '');
            done();
          });

        });

        it('for a POST route with {cors: true} and an Access-Control-Request-Method header set to "POST" should respond with correct Access-Control-Allow-Origin and Access-Control-Allow-Method headers', function(done) {

          httpHelper.testRoute('options', {
            url: 'test2',
            headers: {
              'Access-Control-Request-Method': 'POST',
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-methods'].toLowerCase(), 'get, post, put, delete, options, head');
            done();
          });

        });

        it('for a PUT route with no CORS settings and an Access-Control-Request-Method header set to "PUT" should respond with correct Access-Control-Allow-Origin and Access-Control-Allow-Method headers', function(done) {

          httpHelper.testRoute('options', {
            url: 'test2',
            headers: {
              'Access-Control-Request-Method': 'PUT',
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-methods'].toLowerCase(), 'get, post, put, delete, options, head');
            done();
          });

        });

      });

      describe('a GET request with origin "http://www.example.com"', function() {

        it('to a route without a CORS config should result in a 200 response with a correct Access-Control-Allow-Origin and Access-Control-Expose-Headers header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-expose-headers'], '');
            done();
          });
        });

        it('to a route with "exposeHeaders" configured should result in a 200 response with a correct Access-Control-Allow-Origin and Access-Control-Expose-Headers header', function(done) {
          httpHelper.testRoute('get', {
            url: 'test2',
            headers: {
              'Origin': 'http://www.example.com'
            },
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-expose-headers'], 'x-custom-header');
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
            assert.equal(response.statusCode, 200);
            assert.equal(response.headers['access-control-allow-origin'], '');
            done();
          });
        });

      });


    });


    describe('with "allRoutes: false" and origin "*"', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': false };");
        var routeConfig = {
          'GET /test/find': {
            controller: 'TestController',
            action: 'find',
            cors: true
          },
          'GET /test/update': {
            controller: 'TestController',
            action: 'update',
            cors: 'http://www.example.com'
          },
          'GET /test/create': {
            controller: 'TestController',
            action: 'create',
            cors: 'http://www.different.com'
          },
          'GET /test/destroy': {
            controller: 'TestController',
            action: 'destroy',
            cors: {
              origin: 'http://www.example.com'
            }
          }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
          if (err) {
            return done(err);
          }
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
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });
      });

    });

    describe('with "allRoutes: true" and origin "http://www.example.com", a request', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': 'http://www.example.com', 'allRoutes': true };");
        var routeConfig = {
          'GET /test/find': {
            controller: 'TestController',
            action: 'find',
            cors: false
          },
          'GET /test/update': {
            controller: 'TestController',
            action: 'update',
            cors: 'http://www.example.com'
          },
          'GET /test/create': {
            controller: 'TestController',
            action: 'create',
            cors: 'http://www.different.com'
          },
          'GET /test/destroy': {
            controller: 'TestController',
            action: 'destroy',
            cors: {
              origin: 'http://www.example.com'
            }
          }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
            if (err) {
              return done(err);
            }
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
          'GET /test/destroy': {
            controller: 'TestController',
            action: 'destroy',
            cors: {
              origin: 'http://www.example.com',
              credentials: false
            }
          }
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
          if (err) {
            return done(err);
          }
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
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          assert.equal(response.headers['access-control-allow-credentials'], 'false');
          done();
        });
      });

    });

    describe('with "credentials: false", a request', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), 'module.exports.cors = { origin: \'*\', allRoutes: true, credentials: false};');
        var routeConfig = {
          'GET /test/destroy': {
            controller: 'TestController',
            action: 'destroy',
            cors: {
              origin: 'http://www.example.com',
              credentials: true
            }
          }
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + JSON.stringify(routeConfig));
      });

      it('to a route without a CORS config should result in a 200 response with an Access-Control-Allow-Credentials header with value "false"', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Origin': 'http://www.example.com'
          },
        }, function(err, response) {
          if (err) {
            return done(err);
          }
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
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          assert.equal(response.headers['access-control-allow-credentials'], 'true');
          done();
        });
      });

    });


    // Delete app directory.
    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });


  }); //</describe('CORS config ::')>



  //   ██████╗███████╗██████╗ ███████╗     ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗
  //  ██╔════╝██╔════╝██╔══██╗██╔════╝    ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
  //  ██║     ███████╗██████╔╝█████╗      ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
  //  ██║     ╚════██║██╔══██╗██╔══╝      ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
  //  ╚██████╗███████║██║  ██║██║         ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
  //   ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝          ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
  //

  describe('CSRF config ::', function() {

    before(function(done) {
      appHelper.build(done);
    });


    describe('with CSRF set to `false`', function() {

      it('no CSRF token should be present in view locals', function(done) {
        httpHelper.testRoute('get', 'viewtest/csrf', function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.body.indexOf('csrf=null') !== -1, response.body);
          done();
        });
      });

      it('a request to /csrfToken should result in a 404 error', function(done) {
        httpHelper.testRoute('get', '/csrfToken', function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.statusCode === 404);
          done();
        });
      });

    });

    describe('with CSRF set to `true`', function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), 'module.exports.csrf = true;');
      });

      it("a CSRF token should be present in view locals", function(done) {
        httpHelper.testRoute("get", 'viewtest/csrf', function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.body.match(/csrf=.{36}(?!.)/), response.body);
          done();
        });
      });

      it("a request to /csrfToken should respond with a _csrf token", function(done) {
        httpHelper.testRoute("get", 'csrftoken', function(err, response) {
          if (err) {
            return done(err);
          }
          try {
            var body = JSON.parse(response.body);
            assert(body._csrf, response.body);
            done();
          } catch (e) {
            done(new Error('Unexpected response: ' + response.body));
          }
        });
      });

      it("a POST request without a CSRF token should result in a 403 response", function(done) {

        httpHelper.testRoute("post", 'user', function(err, response) {

          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();

        });

      });

      it("a POST request with a valid CSRF token should result in a 201 response", function(done) {

        httpHelper.testRoute("get", 'csrftoken', function(err, response) {
          if (err) {
            return done(err);
          }
          try {
            var body = JSON.parse(response.body);
            var sid = response.headers['set-cookie'][0].split(';')[0].substr(10);
            httpHelper.testRoute("post", {
              url: 'user',
              headers: {
                'Content-type': 'application/json',
                'cookie': 'sails.sid=' + sid
              },
              body: '{"_csrf":"' + body._csrf + '"}'
            }, function(err, response) {

              if (err) {
                return done(err);
              }

              assert.equal(response.statusCode, 201);
              done();

            });
          } catch (e) {
            done(e);
          }
        });

      });
    });

    describe("with CSRF set to {route: '/anotherCsrf'}", function() {
      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = {route: '/anotherCsrf'};");
      });

      it("a request to /csrfToken should respond with a 404", function(done) {
        httpHelper.testRoute("get", 'csrftoken', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 404);
          done();
        });

      });

      it("a request to /anotherCsrf should respond with a _csrf token", function(done) {
        httpHelper.testRoute("get", 'anotherCsrf', function(err, response) {
          if (err) {
            return done(err);
          }
          try {
            var body = JSON.parse(response.body);
            assert(body._csrf, response.body);
            done();
          } catch (e) {
            done(new Error('Unexpected response: ' + response.body));
          }
        });
      });

      it("a POST request without a CSRF token should result in a 403 response", function(done) {

        httpHelper.testRoute("post", 'user', function(err, response) {

          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();

        });

      });

      it("a POST request with a valid CSRF token should result in a 201 response", function(done) {

        httpHelper.testRoute("get", 'anotherCsrf', function(err, response) {
          if (err) {
            return done(err);
          }
          try {
            var body = JSON.parse(response.body);
            var sid = response.headers['set-cookie'][0].split(';')[0].substr(10);
            httpHelper.testRoute("post", {
              url: 'user',
              headers: {
                'Content-type': 'application/json',
                'cookie': 'sails.sid=' + sid
              },
              body: '{"_csrf":"' + body._csrf + '"}'
            }, function(err, response) {

              if (err) {
                return done(err);
              }

              assert.equal(response.statusCode, 201);
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
        httpHelper.testRoute("get", 'csrftoken', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 404);
          done();
        });

      });

    });

    describe("with CSRF set to {protectionEnabled: true, routesDisabled: '/foo/:id, /user'}", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = {protectionEnabled: true, routesDisabled: '/foo/:id, /user'};");
      });

      it("a POST request on /user without a CSRF token should result in a 201 response", function(done) {
        httpHelper.testRoute("post", 'user', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 201);
          done();
        });
      });

      it("a POST request on /foo/12 without a CSRF token should result in a 404 response", function(done) {
        httpHelper.testRoute("post", 'foo/12', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 404);
          done();
        });
      });

      it("a POST request on /test without a CSRF token should result in a 403 response", function(done) {
        httpHelper.testRoute("post", 'test', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();
        });
      });

      it("a POST request on /foo without a CSRF token should result in a 403 response", function(done) {
        httpHelper.testRoute("post", 'foo', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();
        });
      });

    });

    describe("with CSRF set to {protectionEnabled: true, routesDisabled: /user\\/\\d+/}", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = {protectionEnabled: true, routesDisabled: /user\\/\\d+/};");
      });

      it("a POST request on /user/1 without a CSRF token should result in a 200 response", function(done) {
        httpHelper.testRoute("post", 'user/1', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });
      });

      it("a POST request on /user/a without a CSRF token should result in a 403 response", function(done) {
        httpHelper.testRoute("post", 'user/a', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();
        });
      });

      it("a POST request on /user without a CSRF token should result in a 403 response", function(done) {
        httpHelper.testRoute("post", 'user', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();
        });
      });

    });

    describe("with CSRF set to {protectionEnabled: true, routesDisabled: ['/foo/:id', '/bar/foo', /user\\/\\d+/]}", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = {protectionEnabled: true, routesDisabled: ['/foo/:id', '/bar/foo', /user\\/\\d+/]};");
      });

      it("a POST request on /foo/12 without a CSRF token should result in a 404 response", function(done) {
        httpHelper.testRoute("post", 'foo/12', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 404);
          done();
        });
      });

      it("a POST request on /bar/foo without a CSRF token should result in a 404 response", function(done) {
        httpHelper.testRoute("post", 'bar/foo', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 404);
          done();
        });
      });

      it("a POST request on /user/1 without a CSRF token should result in a 200 response", function(done) {
        httpHelper.testRoute("post", 'user/1', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });
      });

      it("a POST request on /user/a without a CSRF token should result in a 403 response", function(done) {
        httpHelper.testRoute("post", 'user/a', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();
        });
      });

      it("a POST request on /foo without a CSRF token should result in a 403 response", function(done) {
        httpHelper.testRoute("post", 'foo', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();
        });
      });

      it("a POST request on /user without a CSRF token should result in a 403 response", function(done) {
        httpHelper.testRoute("post", 'user', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();
        });
      });

      it("a POST request on /test without a CSRF token should result in a 403 response", function(done) {
        httpHelper.testRoute("post", 'test', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 403);
          done();
        });
      });

    });

    describe("with CSRF set to true and sessions disabled", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = true;");
        fs.writeFileSync(path.resolve('../', appName, 'config/killsession.js'), "module.exports.http = {middleware: {session: function(req, res, next) {return next();}}};");
      });

      it("a POST request on /user without a CSRF token should result in a 201 response", function(done) {
        httpHelper.testRoute("post", 'user', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 201);
          done();
        });

      });

      it("a POST request on /test without a CSRF token should result in a 200 response", function(done) {
        httpHelper.testRoute("post", 'test', function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });

      });

    });

    // Remove test app files/directories.
    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

  }); //</describe('CSRF config ::')>



  //   ██████╗ ██████╗ ██████╗ ███████╗       ██╗        ██████╗███████╗██████╗ ███████╗
  //  ██╔════╝██╔═══██╗██╔══██╗██╔════╝       ██║       ██╔════╝██╔════╝██╔══██╗██╔════╝
  //  ██║     ██║   ██║██████╔╝███████╗    ████████╗    ██║     ███████╗██████╔╝█████╗
  //  ██║     ██║   ██║██╔══██╗╚════██║    ██╔═██╔═╝    ██║     ╚════██║██╔══██╗██╔══╝
  //  ╚██████╗╚██████╔╝██║  ██║███████║    ██████║      ╚██████╗███████║██║  ██║██║
  //   ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚═════╝       ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝
  //
  //   ██╗████████╗ ██████╗  ██████╗ ███████╗████████╗██╗  ██╗███████╗██████╗      █████╗ ████████╗    ██╗      █████╗ ███████╗████████╗██╗
  //  ██╔╝╚══██╔══╝██╔═══██╗██╔════╝ ██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗    ██╔══██╗╚══██╔══╝    ██║     ██╔══██╗██╔════╝╚══██╔══╝╚██╗
  //  ██║    ██║   ██║   ██║██║  ███╗█████╗     ██║   ███████║█████╗  ██████╔╝    ███████║   ██║       ██║     ███████║███████╗   ██║    ██║
  //  ██║    ██║   ██║   ██║██║   ██║██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗    ██╔══██║   ██║       ██║     ██╔══██║╚════██║   ██║    ██║
  //  ╚██╗   ██║   ╚██████╔╝╚██████╔╝███████╗   ██║   ██║  ██║███████╗██║  ██║    ██║  ██║   ██║       ███████╗██║  ██║███████║   ██║   ██╔╝
  //   ╚═╝   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝   ╚═╝       ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝
  //

  describe('CORS+CSRF ::', function() {

    before(function(done) {
      appHelper.build(function(err) {
        if (err) {
          return done(err);
        }
        // Add a CORS config that should be IGNORED by the CSRF hook, which does its own CORS handling
        // If this isn't being ignored properly, then errors should occur when requesting /csrfToken from a different origin
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': 'http://www.example.com,http://www.someplace.com,http://www.different.com', 'allRoutes': true, 'credentials': false};");
        done();
      });
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
        }, function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.statusCode == 200);
          assert(JSON.parse(response.body)._csrf === null, response.body);
          done();
        });
      });

    });

    describe("with CSRF set to {origin: 'http://www.example.com,http://www.someplace.com', credentials: false}", function() {

      before(function() {
        fs.writeFileSync(path.resolve('../', appName, 'config/cors.js'), "module.exports.cors = { 'origin': '*', 'allRoutes': false, 'credentials': false};");
        fs.writeFileSync(path.resolve('../', appName, 'config/csrf.js'), "module.exports.csrf = {origin: ' http://www.example.com, http://www.someplace.com '};");
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), "module.exports.routes = {\"/viewtest/csrf\":{\"cors\":true}}");
      });

      describe("when the request origin header is 'http://www.example.com'", function() {

        it("a CSRF token should be present in view locals", function(done) {
          httpHelper.testRoute("get", {
            url: 'viewtest/csrf',
            headers: {
              origin: "http://www.someplace.com"
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body.match(/csrf=.{36}(?!.)/));
            done();
          });
        });

        it("a request to /csrfToken should respond with a _csrf token", function(done) {
          httpHelper.testRoute("get", {
            url: 'csrfToken',
            headers: {
              origin: "http://www.example.com"
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-credentials'], 'true');
            try {
              var body = JSON.parse(response.body);
              assert(body._csrf, response.body);
              done();
            } catch (e) {
              done(new Error('Unexpected response: ' + response.body));
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
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body.match(/csrf=.{36}(?!.)/));
            done();
          });
        });

        it("a request to /csrfToken should respond with a _csrf token", function(done) {
          httpHelper.testRoute("get", {
            url: 'csrfToken',
            headers: {
              origin: "http://www.someplace.com"
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.someplace.com');
            try {
              var body = JSON.parse(response.body);
              assert(body._csrf, response.body);
              done();
            } catch (e) {
              done(new Error('Unexpected response: ' + response.body));
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
          }, function(err, response) {
            if (err) {
              return done(err);
            }
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
          }, function(err, response) {
            if (err) {
              return done(err);
            }
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
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body.match(/csrf=.{36}(?!.)/));
            done();
          });
        });

        it("a request to /csrfToken should respond with a _csrf token", function(done) {
          httpHelper.testRoute("get", {
            url: 'csrfToken',
            headers: {
              origin: "chrome-extension://postman"
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            try {
              var body = JSON.parse(response.body);
              assert(body._csrf, response.body);
              done();
            } catch (e) {
              done(new Error('Unexpected response: ' + response.body));
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
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body.match(/csrf=.{36}(?!.)/));
            done();
          });
        });

        it("a request to /csrfToken should respond with a _csrf token", function(done) {
          httpHelper.testRoute("get", {
            url: 'csrfToken',
            headers: {
              origin: "http://localhost:1342"
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }

            var body;
            try {
              body = JSON.parse(response.body);
            } catch (e) {
              return done(new Error('Error parsing response: ' + response.body + '\nError details:\n' + e.stack));
            }
            try {
              assert(body._csrf, response.body);
            } catch (e) {
              return done(new Error('Unexpected response: ' + response.body));
            }
            return done();
          });
        });

      });
    });



    // Remove test app files/directories.
    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

  }); //</describe('CORS+CSRF ::')>

});
