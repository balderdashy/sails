/**
 * Module dependencies
 */

var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var tmp = require('tmp');

var Sails = require('../../lib').constructor;


describe('CORS and CSRF ::', function() {


  //   ██████╗ ██████╗ ██████╗ ███████╗     ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗
  //  ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
  //  ██║     ██║   ██║██████╔╝███████╗    ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
  //  ██║     ██║   ██║██╔══██╗╚════██║    ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
  //  ╚██████╗╚██████╔╝██║  ██║███████║    ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
  //   ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
  //

  describe.only('CORS config ::', function() {

    var setups = {
      'with default settings': {
        expectations: [
          {
            route: 'PUT /no-cors-config',
            request_headers: {origin: 'http://example.com'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': undefined,
              'access-control-allow-methods': undefined,
              'access-control-allow-headers': undefined,
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': undefined
            }
          },
          {
            route: 'OPTIONS /no-cors-config',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': undefined,
              'access-control-allow-methods': undefined,
              'access-control-allow-headers': undefined,
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': undefined
            }
          },
          {
            route: 'PUT /cors-true',
            request_headers: {origin: 'http://example.com'},
            response_status: 200,
            response_headers: {
             'access-control-allow-origin': '*',
             'access-control-allow-methods': undefined,
             'access-control-allow-headers': undefined,
             'access-control-allow-credentials': undefined,
             'access-control-exposed-headers': undefined,
             'vary': undefined
            }
          },
          {
            route: 'OPTIONS /cors-true',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': '*',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': undefined
            }
          },
          {
            route: 'OPTIONS /cors-true',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': undefined,
              'access-control-allow-methods': undefined,
              'access-control-allow-headers': undefined,
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': undefined
            }
          },
        ]
      },

      'with `allRoutes: true`': {
        sailsCorsConfig: {allRoutes: true},
        expectations: [
          {
            route: 'PUT /no-cors-config',
            request_headers: {origin: 'http://example.com'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': '*',
              'access-control-allow-methods': undefined,
              'access-control-allow-headers': undefined,
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': undefined
            }
          },
          {
            route: 'OPTIONS /no-cors-config',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': '*',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': undefined
            }
          },
          {
            route: 'PUT /cors-true',
            request_headers: {origin: 'http://example.com'},
            response_status: 200,
            response_headers: {
             'access-control-allow-origin': '*',
             'access-control-allow-methods': undefined,
             'access-control-allow-headers': undefined,
             'access-control-allow-credentials': undefined,
             'access-control-exposed-headers': undefined,
             'vary': undefined
            }
          },
          {
            route: 'OPTIONS /cors-true',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': '*',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': undefined
            }
          },
          {
            route: 'OPTIONS /cors-true',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': '*',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': undefined
            }
          },
        ],
      },
      'with `allRoutes: true`, `credentials: true`, `allowAnyOriginWithCredentialsUnsafe: true`': {
        sailsCorsConfig: {allRoutes: true, credentials: true, allowAnyOriginWithCredentialsUnsafe: true},
        expectations: [
          {
            route: 'PUT /no-cors-config',
            request_headers: {origin: 'http://example.com'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin':'http://example.com',
              'access-control-allow-methods': undefined,
              'access-control-allow-headers': undefined,
              'access-control-allow-credentials': 'true',
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
          {
            route: 'OPTIONS /no-cors-config',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin':'http://example.com',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': 'true',
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
          {
            route: 'PUT /cors-true',
            request_headers: {origin: 'http://example.com'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin':'http://example.com',
              'access-control-allow-methods': undefined,
              'access-control-allow-headers': undefined,
              'access-control-allow-credentials': 'true',
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
          {
            route: 'OPTIONS /cors-true',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin':'http://example.com',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': 'true',
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
          {
            route: 'OPTIONS /cors-true',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin':'http://example.com',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': 'true',
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
        ]
      },
      'with `allRoutes: true`, `origin: http://example.com`': {
        sailsCorsConfig: {allRoutes: true, origin: 'http://example.com'},
        expectations: [
          {
            route: 'PUT /no-cors-config',
            request_headers: {origin: 'http://example.com'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': 'http://example.com',
              'access-control-allow-methods': undefined,
              'access-control-allow-headers': undefined,
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
          {
            route: 'OPTIONS /no-cors-config',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': 'http://example.com',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
          {
            route: 'PUT /cors-true',
            request_headers: {origin: 'http://example.com'},
            response_status: 200,
            response_headers: {
             'access-control-allow-origin': 'http://example.com',
             'access-control-allow-methods': undefined,
             'access-control-allow-headers': undefined,
             'access-control-allow-credentials': undefined,
             'access-control-exposed-headers': undefined,
             'vary': 'Origin'
            }
          },
          {
            route: 'OPTIONS /cors-true',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': 'http://example.com',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
          {
            route: 'OPTIONS /cors-true',
            request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
            response_status: 200,
            response_headers: {
              'access-control-allow-origin': 'http://example.com',
              'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
              'access-control-allow-headers': 'content-type',
              'access-control-allow-credentials': undefined,
              'access-control-exposed-headers': undefined,
              'vary': 'Origin'
            }
          },
          {
            route: 'PUT /cors-true',
            request_headers: {origin: 'http://somewhere.com'},
            response_status: 200,
            response_headers: {
             'access-control-allow-origin': undefined,
             'access-control-allow-methods': undefined,
             'access-control-allow-headers': undefined,
             'access-control-allow-credentials': undefined,
             'access-control-exposed-headers': undefined,
             'vary': undefined
            }
          },
        ]
      }
    };

    _.each(setups, function(setup, name) {
      describe(name, function() {
        var sailsApp;

        before(function(done) {
          (new Sails()).load({
              hooks: {grunt: false, views: false, blueprints: false, policies: false},
              log: {level: 'error'},
              cors: setup.sailsCorsConfig,
              routes: {
                'PUT /no-cors-config': function(req, res){return res.ok();},
                'PUT /cors-true': {cors: true, target: function(req, res){return res.ok();}},
              }
            }, function(err, _sails) {
              sailsApp = _sails;
              return done(err);
            }
          );
        });

        after(function(done) {
          sailsApp.lower(done);
        });

        _.each(setup.expectations, function(expectation) {
          var routeParts = expectation.route.split(' ');
          var method = routeParts[0];
          var path = routeParts[1];
          describe('a ' + method.toUpperCase() + ' request to ' + path + ' using ' + JSON.stringify(expectation.request_headers), function() {

            var responseHolder = {};
            before(function(done) {
              sailsApp.request({
                url: path,
                method: method,
                headers: expectation.request_headers
              }, function (err, response, data) {
                if (err) {return done(err);}
                responseHolder.response = response;
                return done();
              });
            });

            it('should respond with status code ' + expectation.response_status, function() {
              assert.equal(responseHolder.response.statusCode, expectation.response_status);
            });

            expectHeaders(responseHolder, expectation.response_headers);

          });
        });

      });
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

      before(function() {
        var routeConfig = {
          'GET /viewtest/csrf': {
            action: 'viewtest.csrf'
          }
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + JSON.stringify(routeConfig));
      });

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
        var routeConfig = "{'GET /viewtest/csrf': {action: 'viewtest.csrf'}, 'POST /user': function(req, res) {return res.send(201);}, 'POST /user/:id': function(req, res) {return res.send(200);}};";
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + routeConfig);
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
        var routeConfig = "{'GET /viewtest/csrf': {action: 'viewtest.csrf'}, 'POST /user': function(req, res) {return res.send(201);}, 'POST /user/:id': function(req, res) {return res.send(200);}};";
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + routeConfig);
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
        var routeConfig = "{'GET /viewtest/csrf': {action: 'viewtest.csrf'}, 'POST /user': function(req, res) {return res.send(201);}, 'POST /user/:id': function(req, res) {return res.send(200);}};";
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + routeConfig);
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
        var routeConfig = "{'GET /viewtest/csrf': {action: 'viewtest.csrf'}, 'POST /user': function(req, res) {return res.send(201);}, 'POST /user/:id': function(req, res) {return res.send(200);}};";
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + routeConfig);
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
        var routeConfig = "{'GET /viewtest/csrf': {action: 'viewtest.csrf'}, 'POST /user': function(req, res) {return res.send(201);}, 'POST /user/:id': function(req, res) {return res.send(200);}};";
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + routeConfig);
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
        var routeConfig = "{'POST /test': {action: 'test.create'}, 'GET /viewtest/csrf': {action: 'viewtest.csrf'}, 'POST /user': function(req, res) {return res.send(201);}, 'POST /user/:id': function(req, res) {return res.send(200);}};";
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + routeConfig);
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
        var routeConfig = {
          'GET /viewtest/csrf': {
            action: 'viewtest.csrf'
          }
        };
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), 'module.exports.routes = ' + JSON.stringify(routeConfig));
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

  function makeRequest(options, responseHolder, sailsApp) {
    return function(done) {
      sailsApp.request(options, function (err, response, data) {
        if (err) {return done(err);}
        responseHolder.response = response;
        return done();
      });
    };
  }

  function expectHeaders(responseHolder, headers) {
    _.each(headers, function(val, header) {
      if (_.isUndefined(val)) {
        it('`' + header + '` should be undefined', function(){ assert(_.isUndefined(responseHolder.response.headers[header]), responseHolder.response.headers[header]); });
      } else {
        it('`' + header + '` should be `' + val + '`', function(){ assert.equal(responseHolder.response.headers[header], val); });
      }
    });

  }

});
