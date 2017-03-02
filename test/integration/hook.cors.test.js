/**
 * Module dependencies
 */

var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');
var _ = require('@sailshq/lodash');
var tmp = require('tmp');

var Sails = require('../../lib').constructor;


describe('CORS config ::', function() {

  var setups = {
    'with default settings': {
      expectations: [
        {
          route: 'PUT /no-cors-config',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'OPTIONS /no-cors-config',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
           'access-control-allow-origin': '*',
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
          }
        },
        {
          route: 'OPTIONS /cors-true',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /origin-example-com',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-headers': 'content-type',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /origin-example-com',
          request_headers: {origin: 'http://somewhere.com'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'OPTIONS /origin-example-com',
          request_headers: {origin: 'http://somewhere.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'OPTIONS /origin-example-com',
          request_headers: {origin: 'http://somewhere.com', 'access-control-request-method': 'POST'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /origin-example-com-somewhere-com',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com-somewhere-com',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-headers': 'content-type',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com-somewhere-com',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /origin-example-com-somewhere-com',
          request_headers: {origin: 'http://somewhere.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://somewhere.com',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com-somewhere-com',
          request_headers: {origin: 'http://somewhere.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://somewhere.com',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-headers': 'content-type',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com-somewhere-com',
          request_headers: {origin: 'http://somewhere.com', 'access-control-request-method': 'POST'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /origin-example-com-somewhere-com-array',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com-somewhere-com-array',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-headers': 'content-type',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com-somewhere-com-array',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /origin-example-com-somewhere-com-array',
          request_headers: {origin: 'http://somewhere.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://somewhere.com',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com-somewhere-com-array',
          request_headers: {origin: 'http://somewhere.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://somewhere.com',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-headers': 'content-type',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /origin-example-com-somewhere-com-array',
          request_headers: {origin: 'http://somewhere.com', 'access-control-request-method': 'POST'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /all-methods-origin-example-com',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /all-methods-origin-example-com',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-headers': 'content-type',
            'vary': 'Origin'
          }
        },
        {
          route: 'POST /all-methods-origin-example-com',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'vary': 'Origin'
          }
        },
        {
          route: 'OPTIONS /all-methods-origin-example-com',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'POST'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-headers': 'content-type',
            'vary': 'Origin'
          }
        },

        {
          route: 'DELETE /unsafe',
          request_headers: {origin: 'http://foobar.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://foobar.com',
            'access-control-allow-credentials': 'true',
            'vary': 'Origin'
          }
        },

        {
          route: 'OPTIONS /unsafe',
          request_headers: {origin: 'http://foobar.com', 'access-control-request-method': 'DELETE'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://foobar.com',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-credentials': 'true',
            'access-control-allow-headers': 'content-type',
            'vary': 'Origin'
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
          }
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
           'access-control-allow-origin': '*',
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
          }
        },
      ],
    },
    'with `allRoutes: true`, `allowCredentials: true`, `allowAnyOriginWithCredentialsUnsafe: true`': {
      sailsCorsConfig: {allRoutes: true, allowCredentials: true, allowAnyOriginWithCredentialsUnsafe: true},
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
      sailsCorsConfig: {allRoutes: true, allowOrigins: 'http://example.com'},
      expectations: [
        {
          route: 'PUT /no-cors-config',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
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
            'vary': 'Origin'
          }
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
           'access-control-allow-origin': 'http://example.com',
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
            'vary': 'Origin'
          }
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://somewhere.com'},
          response_status: 200,
          response_headers: null
        },
      ]
    },
    'with `allRoutes: true`, `origin: http://example.com, http://somewhere.com`': {
      sailsCorsConfig: {allRoutes: true, allowOrigins: 'http://example.com, http://somewhere.com'},
      expectations: [
        {
          route: 'PUT /no-cors-config',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
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
            'vary': 'Origin'
          }
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
           'access-control-allow-origin': 'http://example.com',
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
            'vary': 'Origin'
          }
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://somewhere.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://somewhere.com',
            'vary': 'Origin'
          }
        },
      ]
    },
    'with `allRoutes: true`, `origin: [\'http://example.com\', \'http://somewhere.com\']`': {
      sailsCorsConfig: {allRoutes: true, allowOrigins: ['http://example.com', 'http://somewhere.com']},
      expectations: [
        {
          route: 'PUT /no-cors-config',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
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
            'vary': 'Origin'
          }
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
           'access-control-allow-origin': 'http://example.com',
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
            'vary': 'Origin'
          }
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://somewhere.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://somewhere.com',
            'vary': 'Origin'
          }
        },
      ]
    },
    'with `allowRequestHeaders: \'x-foo-bar\'`, `allowResponseHeaders: \'x-owl-hoot\'`, `allowRequestMethods: \'PUT,POST\'`': {
      sailsCorsConfig: {allowRequestHeaders: 'x-foo-bar', allowResponseHeaders: 'x-owl-hoot', allowRequestMethods: 'PUT,POST'},
      expectations: [
        {
          route: 'PUT /no-cors-config',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: null
        },
        {
          route: 'PUT /cors-true',
          request_headers: {origin: 'http://example.com'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': '*',
          }
        },
        {
          route: 'OPTIONS /cors-true',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'PUT,POST',
            'access-control-allow-headers': 'x-foo-bar',
            'access-control-expose-headers': 'x-owl-hoot',
          }
        },
        {
          route: 'OPTIONS /origin-example-com',
          request_headers: {origin: 'http://example.com', 'access-control-request-method': 'PUT'},
          response_status: 200,
          response_headers: {
            'access-control-allow-origin': 'http://example.com',
            'access-control-allow-methods': 'PUT,POST',
            'access-control-allow-headers': 'x-foo-bar',
            'access-control-expose-headers': 'x-owl-hoot',
            'vary': 'Origin'
          }
        },
      ]
    }
  };

  var only = _.findKey(setups, function(setup, name) {
    if (name.indexOf('only.') === 0) {
      return name;
    }
  });

  if (only) {
    setups = (function(){
      var onlySetup = setups[only];
      newSetups = {};
      newSetups[only.replace(/^only\./,'')] = onlySetup;
      return newSetups;
    })();
  }

  _.each(setups, function(setup, name) {
    if (name.indexOf('skip.') === 0) {
      return;
    }
    describe(name, function() {
      var sailsApp;

      before(function(done) {
        (new Sails()).load({
            hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
            log: {level: 'error'},
            security: {
              cors: _.cloneDeep(setup.sailsCorsConfig)
            },
            routes: {
              'PUT /no-cors-config': function(req, res){return res.ok();},
              'PUT /cors-true': {cors: true, target: function(req, res){return res.ok();}},
              'PUT /origin-example-com': {cors: {allowOrigins: 'http://example.com'}, target: function(req, res){return res.ok();}},
              'PUT /origin-example-com-somewhere-com': {cors: {allowOrigins: 'http://example.com, http://somewhere.com'}, target: function(req, res){return res.ok();}},
              'PUT /origin-example-com-somewhere-com-array': {cors: {allowOrigins: ['http://example.com', 'http://somewhere.com']}, target: function(req, res){return res.ok();}},
              '/all-methods-origin-example-com': {cors: {allowOrigins: 'http://example.com'}, target: function(req, res){return res.ok();}},
              '/unsafe': {cors: {allowOrigins: '*', allowCredentials: true, allowAnyOriginWithCredentialsUnsafe: true}, target: function(req, res){return res.ok();}},
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

          var expectedHeaders = _.extend({}, {
            'access-control-allow-origin': undefined,
            'access-control-allow-methods': undefined,
            'access-control-allow-headers': undefined,
            'access-control-allow-credentials': undefined,
            'access-control-exposed-headers': undefined,
            'vary': undefined
          }, expectation.response_headers || {});

          expectHeaders(responseHolder, expectedHeaders);

        });
      });

    });

    describe(name + ' (with deprecated config)', function() {
      var sailsApp;

      before(function(done) {
        (new Sails()).load({
            hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
            log: {level: 'silent'},
            cors: _.cloneDeep(setup.sailsCorsConfig),
            routes: {
              'PUT /no-cors-config': function(req, res){
                return res.ok();
              },
              'PUT /cors-true': {cors: true, target: function(req, res){return res.ok();}},
              'PUT /origin-example-com': {cors: {origin: 'http://example.com'}, target: function(req, res){return res.ok();}},
              'PUT /origin-example-com-somewhere-com': {cors: {origin: 'http://example.com, http://somewhere.com'}, target: function(req, res){return res.ok();}},
              'PUT /origin-example-com-somewhere-com-array': {cors: {origin: ['http://example.com', 'http://somewhere.com']}, target: function(req, res){return res.ok();}},
              '/all-methods-origin-example-com': {cors: {origin: 'http://example.com'}, target: function(req, res){return res.ok();}},
              '/unsafe': {cors: {origin: '*', allowCredentials: true, allowAnyOriginWithCredentialsUnsafe: true}, target: function(req, res){return res.ok();}},
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

          var expectedHeaders = _.extend({}, {
            'access-control-allow-origin': undefined,
            'access-control-allow-methods': undefined,
            'access-control-allow-headers': undefined,
            'access-control-allow-credentials': undefined,
            'access-control-exposed-headers': undefined,
            'vary': undefined
          }, expectation.response_headers || {});

          expectHeaders(responseHolder, expectedHeaders);

        });
      });

    });
  });

  describe('with invalid global CORS config ({allowOrigins: \'*\', allowCredentials: true})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          cors: {allowOrigins: '*', allowCredentials: true},
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid global CORS config!'));
        }
      );
    });

  });

  describe('with invalid global CORS config ({allowOrigins: 666})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          cors: {allowOrigins: 666},
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid global CORS config!'));
        }
      );
    });
  });

  describe('with invalid global CORS config ({allowOrigins: [\'localboast.yarg\']})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          cors: {allowOrigins: ['localboast.yarg']},
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid global CORS config!'));
        }
      );
    });
  });

  describe('with invalid global CORS config ({allowOrigins: [\'http://localboast.com:80\']})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          cors: {allowOrigins: ['http://localboast.com:80']},
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid global CORS config!'));
        }
      );
    });
  });

  describe('with invalid global CORS config ({allowOrigins: [\'https://localboast.com:443\']})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          cors: {allowOrigins: ['https://localboast.com:443']},
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid global CORS config!'));
        }
      );
    });
  });

  describe('with invalid global CORS config ({allowOrigins: [\'\']})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          cors: {allowOrigins: ['']},
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid global CORS config!'));
        }
      );
    });
  });

  describe('with invalid global CORS config ({allowOrigins: [666]})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          cors: {allowOrigins: [666]},
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid global CORS config!'));
        }
      );
    });
  });

  describe('with invalid route CORS config ({allRoutes: true, origin: \'*\', allowCredentials: true})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          routes: {
            '/invalid': {cors: {allowOrigins: '*', allowCredentials: true}}
          }
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid route CORS config!'));
        }
      );
    });

  });

  describe('with invalid route CORS config ({allowOrigins: [666]})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          routes: {
            '/invalid': {cors: {allowOrigins: [666]}}
          }
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid route CORS config!'));
        }
      );
    });

  });

  describe('with invalid route CORS config ({allowOrigins: 666})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          routes: {
            '/invalid': {cors: {allowOrigins: 666}}
          }
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid route CORS config!'));
        }
      );
    });

  });

  describe('with invalid route CORS config ({allowOrigins: [\'blah\']})', function() {

    it('should fail to lift', function(done) {
      (new Sails()).load({
          hooks: {grunt: false, views: false, blueprints: false, policies: false, i18n: false},
          log: {level: 'silent'},
          routes: {
            '/invalid': {cors: {allowOrigins: ['blah']}}
          }
        }, function(err, _sails) {
          if (err) {return done();}
          return done(new Error('Sails should have failed to lift with invalid route CORS config!'));
        }
      );
    });

  });

}); //</describe('CORS config ::')>


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
      it('`' + header + '` should be undefined', function(){ assert(_.isUndefined(responseHolder.response.headers[header]), 'Got `' + responseHolder.response.headers[header] + '` instead'); });
    } else {
      it('`' + header + '` should be `' + val + '`', function(){ assert.equal(responseHolder.response.headers[header], val); });
    }
  });

}


