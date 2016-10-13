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


describe('CSRF ::', function() {

  describe('Basic CSRF config ::', function() {

    var sailsConfig = {};

    var sailsApp;
    beforeEach(function(done) {
      var _config = _.merge({
        hooks: {grunt: false, views: false, blueprints: false, policies: false},
        log: {level: 'error'},
        routes: {
          'GET /viewtest/csrf': function(req, res) {res.send('csrf=' + res.locals._csrf);},
          'POST /user': function(req, res) {
            return res.send(201);
          },
          'POST /user/:id': function(req, res) {
            return res.send(200);
          }
        }
      }, sailsConfig);
      (new Sails()).load(_config, function(err, _sails) {
          sailsApp = _sails;
          return done(err);
        }
      );
    });

    afterEach(function(done) {
      sailsApp.lower(done);
    });

    describe('with CSRF set to `false`', function() {

      before(function() {
        sailsConfig = {};
      });

      it('no CSRF token should be present in view locals', function(done) {
        sailsApp.request({url: '/viewtest/csrf', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.body.indexOf('csrf=null') !== -1, response.body);
          done();
        });
      });

      it('a request to /csrfToken should result in a 404 error', function(done) {
        sailsApp.request({url: '/csrfToken', method: 'get'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + err || response.body));
        });
      });

    });

    describe('with CSRF set to `true`', function() {

      before(function() {

        sailsConfig = {
          csrf: true
        };

      });

      it('a CSRF token should be present in view locals', function(done) {
        sailsApp.request({url: '/viewtest/csrf', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.body.match(/csrf=.{36}(?!.)/), response.body);
          done();
        });
      });

      it('a request to /csrfToken should respond with a _csrf token', function(done) {
        sailsApp.request({url: '/csrftoken', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.body._csrf, response.body);
          return done();
        });
      });

      it('a POST request without a CSRF token should result in a 403 response', function(done) {

        sailsApp.request({url: '/user', method: 'post'}, function(err, response) {

          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));

        });

      });

      it('a POST request with a valid CSRF token should result in a 201 response', function(done) {

        sailsApp.request({url: '/csrftoken', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          try {
            var body = response.body;
            var sid = response.headers['set-cookie'][0].split(';')[0].substr(10);
            sailsApp.request({
              method: 'post',
              url: '/user',
              headers: {
                'Content-type': 'application/json',
                'cookie': 'sails.sid=' + sid
              },
              data: {_csrf: body._csrf}
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

    describe('with CSRF set to {route: \'/anotherCsrf\'}', function() {

      before(function() {

        sailsConfig = {
          csrf: {route: '/anotherCsrf'}
        };

      });

      it('a request to /csrfToken should respond with a 404', function(done) {
        sailsApp.request({url: '/csrftoken', method: 'get'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + err || response.body));
        });
      });

      it('a request to /anotherCsrf should respond with a _csrf token', function(done) {
        sailsApp.request({url: '/anotherCsrf', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          try {
            var body = response.body;
            assert(body._csrf, response.body);
            done();
          } catch (e) {
            done(new Error('Unexpected response: ' + response.body));
          }
        });
      });

      it('a POST request without a CSRF token should result in a 403 response', function(done) {

        sailsApp.request({url: '/user', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });

      });

      it('a POST request with a valid CSRF token should result in a 201 response', function(done) {

        sailsApp.request({url: '/anotherCsrf', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          try {
            var body = response.body;
            var sid = response.headers['set-cookie'][0].split(';')[0].substr(10);
            sailsApp.request({
              method:'post',
              url: '/user',
              headers: {
                'Content-type': 'application/json',
                'cookie': 'sails.sid=' + sid
              },
              data: {_csrf: body._csrf}
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

    describe('with CSRF set to {protectionEnabled: true, grantTokenViaAjax: false}', function() {

      before(function() {

        sailsConfig = {
          csrf: {protectionEnabled: true, grantTokenViaAjax: false}
        };

      });


      it('a request to /csrfToken should respond with a 404', function(done) {
        sailsApp.request({url: '/csrftoken', method: 'get'}, function(err, response) {

          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + err || response.body));

        });

      });

    });

    describe('with CSRF set to {protectionEnabled: true, routesDisabled: \'/foo/:id, /user\'}', function() {

      before(function() {

        sailsConfig = {
          csrf: {protectionEnabled: true, routesDisabled: '/foo/:id, /user'}
        };

      });

      it('a POST request on /user without a CSRF token should result in a 201 response', function(done) {
        sailsApp.request({
          method: 'post',
          url: '/user'
        }, function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 201);
          done();
        });
      });

      it('a POST request on /foo/12 without a CSRF token should result in a 404 response', function(done) {
        sailsApp.request({url: '/foo/12', method: 'post'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + err || response.body));
        });
      });

      it('a POST request on /test without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/test', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });
      });

      it('a POST request on /foo without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/foo', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });
      });

    });

    describe('with CSRF set to {protectionEnabled: true, routesDisabled: /user\\/\\d+/}', function() {

      before(function() {

        sailsConfig = {
          csrf: {protectionEnabled: true, routesDisabled: /user\/\d+/}
        };

      });

      it('a POST request on /user/1 without a CSRF token should result in a 200 response', function(done) {
        sailsApp.request({url: '/user/1', method: 'post'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });
      });

      it('a POST request on /user/a without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user/a', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });
      });

      it('a POST request on /user without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });
      });

    });

    describe('with CSRF set to {protectionEnabled: true, routesDisabled: [\'/foo/:id\', \'/bar/foo\', /user\\/\\d+/]}', function() {

      before(function() {

        sailsConfig = {
          csrf: {protectionEnabled: true, routesDisabled: ['/foo/:id', '/bar/foo', /user\/\d+/]}
        };

      });

      it('a POST request on /foo/12 without a CSRF token should result in a 404 response', function(done) {
        sailsApp.request({url: '/foo/12', method: 'post'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + err || response.body));
        });
      });

      it('a POST request on /bar/foo without a CSRF token should result in a 404 response', function(done) {
        sailsApp.request({url: '/bar/foo', method: 'post'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + err || response.body));
        });
      });

      it('a POST request on /user/1 without a CSRF token should result in a 200 response', function(done) {
        sailsApp.request({url: '/user/1', method: 'post'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });
      });

      it('a POST request on /user/a without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user/a', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });
      });

      it('a POST request on /foo without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/foo', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });
      });

      it('a POST request on /user without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });
      });

      it('a POST request on /test without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/test', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + err || response.body));
        });
      });

    });

    describe('with CSRF set to true and sessions disabled', function() {

      before(function() {

        sailsConfig = {
          csrf: true,
          hooks: {session: false}
        };

      });

      it('a POST request on /user without a CSRF token should result in a 201 response', function(done) {
        sailsApp.request({url: '/user', method: 'post'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 201);
          done();
        });

      });

      it('a POST request on /user/:id without a CSRF token should result in a 200 response', function(done) {
        sailsApp.request({url: '/user/123', method: 'post'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });

      });

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

    var sailsConfig = {};

    var sailsApp;
    beforeEach(function(done) {
      var _config = _.merge({
        hooks: {grunt: false, views: false, blueprints: false, policies: false},
        log: {level: 'error'},
      }, sailsConfig);
      (new Sails()).load(_config, function(err, _sails) {
          sailsApp = _sails;
          return done(err);
        }
      );
    });

    afterEach(function(done) {
      sailsApp.lower(done);
    });

    describe('with CSRF set to true (no origin set)', function() {

      before(function() {

        sailsConfig = {
          csrf: true
        };

      });

      it('a request to /csrfToken should result in a 200 response and a null token', function(done) {
        sailsApp.request({
          method: 'get',
          url: '/csrfToken',
          headers: {
            origin: 'http://www.example.com'
          }
        }, function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.statusCode === 200);
          assert(response.body._csrf === null, response.body);
          done();
        });
      });

    });

    describe('with CSRF set to {origin: \'http://www.example.com,http://www.someplace.com\', credentials: false}', function() {

      before(function() {

        sailsConfig = {
          cors: { origin: '*', allRoutes: false, credentials : false},
          csrf: { origin: ' http://www.example.com, http://www.someplace.com '},
          routes: {'/viewtest/csrf':{cors:true, target: function(req, res) {res.send('csrf=' + res.locals._csrf);}}}
        };

      });

      describe('when the request origin header is \'http://www.example.com\'', function() {

        it('a CSRF token should be present in view locals', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/viewtest/csrf',
            headers: {
              origin: 'http://www.someplace.com'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body.match(/csrf=.{36}(?!.)/));
            done();
          });
        });

        it('a request to /csrfToken should respond with a _csrf token', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/csrfToken',
            headers: {
              origin: 'http://www.example.com'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.example.com');
            assert.equal(response.headers['access-control-allow-credentials'], 'true');
            try {
              var body = response.body;
              assert(body._csrf, response.body);
              done();
            } catch (e) {
              done(new Error('Unexpected response: ' + response.body));
            }
          });
        });

      });

      describe('when the request origin header is \'http://www.someplace.com\'', function() {

        it('a CSRF token should be present in view locals', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/viewtest/csrf',
            headers: {
              origin: 'http://www.someplace.com'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body.match(/csrf=.{36}(?!.)/));
            done();
          });
        });

        it('a request to /csrfToken should respond with a _csrf token', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/csrfToken',
            headers: {
              origin: 'http://www.someplace.com'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert.equal(response.headers['access-control-allow-origin'], 'http://www.someplace.com');
            try {
              var body = response.body;
              assert(body._csrf, response.body);
              done();
            } catch (e) {
              done(new Error('Unexpected response: ' + response.body));
            }
          });
        });

      });

      describe('when the request origin header is \'http://www.different.com\'', function() {

        it('no CSRF token should be present in view locals', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/viewtest/csrf',
            headers: {
              origin: 'http://www.different.com'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body.indexOf('csrf=null') !== -1, response.body);
            done();
          });
        });

        it('a request to /csrfToken should result in a 200 response and a null token', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/csrfToken',
            headers: {
              origin: 'http://www.different.com'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body._csrf === null, response.body);
            assert(response.statusCode === 200);
            done();
          });
        });

      });

      describe('when the request origin header is \'chrome-extension://postman\'', function() {

        it('a CSRF token should be present in view locals', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/viewtest/csrf',
            headers: {
              origin: 'chrome-extension://postman'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            assert(response.body.match(/csrf=.{36}(?!.)/));
            done();
          });
        });

        it('a request to /csrfToken should respond with a _csrf token', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/csrfToken',
            headers: {
              origin: 'chrome-extension://postman'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            try {
              var body = response.body;
              assert(body._csrf, response.body);
              done();
            } catch (e) {
              done(new Error('Unexpected response: ' + response.body));
            }
          });
        });

      });

      xdescribe('when the request is from the same origin (http://localhost:1342)', function() {

        it('a CSRF token should be present in view locals', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/viewtest/csrf',
            headers: {
              origin: 'http://localhost:1342',
              host: 'http://localhost:1342'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }
            console.log(response.body);
            assert(response.body.match(/csrf=.{36}(?!.)/));
            done();
          });
        });

        it('a request to /csrfToken should respond with a _csrf token', function(done) {
          sailsApp.request({
            method: 'get',
            url: '/csrfToken',
            headers: {
              origin: 'http://localhost:1342'
            }
          }, function(err, response) {
            if (err) {
              return done(err);
            }

            var body;
            try {
              body = response.body;
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
