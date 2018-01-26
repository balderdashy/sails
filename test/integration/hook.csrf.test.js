/**
 * Module dependencies
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var _ = require('@sailshq/lodash');
var tmp = require('tmp');
var Sails = require('../../lib').constructor;
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');



describe('CSRF ::', function() {

  describe('Basic CSRF config ::', function() {

    var sailsConfig = {};

    var sailsApp;
    beforeEach(function(done) {
      var _config = _.merge({
        hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
        log: {level: 'error'},
        routes: {
          '/csrfToken': {action: 'security/grant-csrf-token'},
          'ALL /viewtest/csrf': function(req, res) {
            var template = _.template('csrf=\'<%-_csrf%>\'');
            res.send(template(res.locals));
          },
          'GET /user': function(req, res) {
            return res.sendStatus(200);
          },
          'POST /user': function(req, res) {
            return res.status(201).send();
          },
          'POST /user/:id': function(req, res) {
            return res.sendStatus(200);
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

      it('a blank CSRF token should be present in view locals', function(done) {
        sailsApp.request({url: '/viewtest/csrf', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.body.indexOf('csrf=\'\'') !== -1, response.body);
          done();
        });
      });

    });

    describe('with CSRF set to `true`', function() {

      before(function() {

        sailsConfig = {
          security: {
            csrf: true
          }
        };

      });

      it('a HEAD request to a route with the CSRF used as a view local should not result in an error', function(done) {
        sailsApp.request({url: '/viewtest/csrf', method: 'head'}, function(err, response) {
          if (err) {
            return done(err);
          }
          done();
        });
      });

      it('an OPTIONS request to a route with the CSRF used as a view local should not result in an error', function(done) {
        sailsApp.request({url: '/viewtest/csrf', method: 'options'}, function(err, response) {
          if (err) {
            return done(err);
          }
          done();
        });
      });

      it('a CSRF token should be present in view locals', function(done) {
        sailsApp.request({url: '/viewtest/csrf', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert(response.body.match(/csrf='.{36}'/), response.body);
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
          done(new Error('Expected a 403 error, instead got: ' + (err || response.body)));

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

    describe('with CSRF set to true, blacklisting \'POST /foo/:id, POST /bar/:id?, /user\'}', function() {

      before(function() {

        sailsConfig = {
          security: {
            csrf: true
          },
          routes: {
            // Note -- since we don't actually define a target for these, requests that pass CSRF should return a 404.
            'POST /foo/:id': {csrf: false},
            '/bar/:id?': {csrf: false},
            '/user': {csrf: false}
          }
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
          done(new Error('Expected a 404 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /foo/12?abc=123 without a CSRF token should result in a 404 response', function(done) {
        sailsApp.request({url: '/foo/12?abc=123', method: 'post'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /bar/12 without a CSRF token should result in a 404 response', function(done) {
        sailsApp.request({url: '/bar/12', method: 'post'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /bar/12?abc=123 without a CSRF token should result in a 404 response', function(done) {
        sailsApp.request({url: '/bar/12?abc=123', method: 'post'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /bar without a CSRF token should result in a 404 response', function(done) {
        sailsApp.request({url: '/bar', method: 'post'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /bar?abc=123 without a CSRF token should result in a 404 response', function(done) {
        sailsApp.request({url: '/bar?abc=123', method: 'post'}, function(err, response) {
          if (err && err.status === 404) {
            return done();
          }
          done(new Error('Expected a 404 error, instead got: ' + (err || response.body)));
        });
      });

      it('a PUT request on /foo/12 without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/foo/12', method: 'put'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /test without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/test', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /foo without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/foo', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + (err || response.body)));
        });
      });

    });

    describe('with CSRF set to true, blacklisting \'POST /user\\/\\d+/\'', function() {

      before(function() {

        sailsConfig = {
          security: {
            csrf: true
          },
          routes: {
            'POST r|user/\\d+|': {csrf: false}
          }
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

      it('a PUT request on /user/1 without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user/1', method: 'put'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /user/a without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user/a', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /user without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + (err || response.body)));
        });
      });

    });

    describe('with CSRF set to false, whitelisting \'/user\\/\\d+/\'', function() {

      before(function() {

        sailsConfig = {
          security: {
            csrf: false
          },
          routes: {
            'r|user/\\d+|': {csrf: true}
          }
        };

      });

      it('a POST request on /user/1 without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user/1', method: 'post'}, function(err, response) {
          if (err && err.status === 403) {
            return done();
          }
          done(new Error('Expected a 403 error, instead got: ' + (err || response.body)));
        });
      });

      it('a POST request on /user/a without a CSRF token should result in a 200 response', function(done) {
        sailsApp.request({url: '/user/a', method: 'post'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });
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

    });


    describe('with CSRF set to true and sessions disabled', function() {

      before(function() {

        sailsConfig = {
          security: {
            csrf: false
          },
          hooks: {session: false},
          routes: {
            'GET /user': {csrf: true, target: function(req, res) {
              return res.sendStatus(200);
            }},
            'POST /user': {csrf: true, target: function(req, res) {
              return res.status(201).send();
            }}
          }
        };

      });

      it('a GET request on /user should result in a 200 response', function(done) {
        sailsApp.request({url: '/user', method: 'get'}, function(err, response) {
          if (err) {
            return done(err);
          }
          assert.equal(response.statusCode, 200);
          done();
        });

      });

      it('a POST request on /user without a CSRF token should result in a 403 response', function(done) {
        sailsApp.request({url: '/user', method: 'post'}, function(err, response) {
          assert(err);
          assert.equal(err.status, 403);
          done();
        });

      });

    });

  }); //</describe('CSRF config ::')>

  describe('With CSRF set to `true` globally and the session hook disabled :: ', function() {
    it('should fail to lift', function(done) {
      (new Sails()).load({security: {csrf: true}, hooks: {session: false}}, function(err, _sails) {
          if (err) { return done(); }
          _sails.lower(function() {
            return done(new Error('Sails lifted successfully, but it should have failed!'));
          });
        }
      );
    });
  });

});
