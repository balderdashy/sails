/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('@sailshq/lodash');
var request = require('@sailshq/request');

var Filesystem = require('machinepack-fs');

var appHelper = require('../integration/helpers/appHelper');
var Sails = require('../../lib').constructor;
var benchmarx = require('./helpers/benchmarx');

if (process.env.BENCHMARK) {

  tmp.setGracefulCleanup();


  describe('benchmarks', function() {
    describe('sails requests :: ', function() {
      describe('generic requests ::', function() {

        this.timeout(0);
        describe('baseline (load only, no hooks) ::', function() {

          var curDir, tmpDir, sailsApp;
          var warn;
          var warnings = [];


          before(function(done) {
            // Cache the current working directory.
            curDir = process.cwd();
            // Create a temp directory.
            tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
            // Switch to the temp directory.
            process.chdir(tmpDir.name);

            // Load the Sails app.
            (new Sails()).load({
              loadHooks: [],
              log: {level: 'silent'},
              routes: {
                '/test1': function(req, res) { return res.status(200).send(); },
                'GET /test2': function(req, res) { return res.status(200).send(); },
                'POST /test3': function(req, res) { return res.status(200).send(); },
                '/test4/:id': function(req, res) { return res.status(200).send(); },
                '/test5/*': function(req, res) { return res.status(200).send(); },
                'r|test6/\\d+|foo': function(req, res) { return res.status(200).send(); },

                '/test7': function(req, res) { return res.status(200).send('foo'); },
                '/test8': function(req, res) { return res.status(200).json({foo: 'bar'}); },

                'POST /test9': function(req, res) { return res.status(200).send(req.param('foo')); },

                'POST /test10': function(req, res) { return res.status(200).json(req.allParams); },
              }
            }, function(err, _sails) {
              sailsApp = _sails;
              return done(err);
            });
          });

          after(function(done) {
            sailsApp.lower(function() {
              process.chdir(curDir);
              return done();
            });
          });

          it('', function(done) {
            benchmarx('', [
              function route_with_no_verb(done) {
                sailsApp.request('http://localhost:1342/test1', done);
              },
              function route_with_GET_verb(done) {
                sailsApp.request('http://localhost:1342/test2', done);
              },
              function route_with_POST_verb(done) {
                sailsApp.request({
                  url: 'http://localhost:1342/test3',
                  method: 'post',
                  data: {foo: 'bar'}
                }, done);
              },
              function route_with_dynamic_param(done) {
                sailsApp.request('http://localhost:1342/test4/123', done);
              },
              function route_with_wildcard(done) {
                sailsApp.request('http://localhost:1342/test5/abc/123', done);
              },
              function route_with_regex(done) {
                sailsApp.request('http://localhost:1342/test6/666', done);
              },
              function respond_with_string(done) {
                sailsApp.request('http://localhost:1342/test7', done);
              },
              function respond_with_json(done) {
                sailsApp.request('http://localhost:1342/test8', done);
              },
              function reflect_one_param(done) {
                sailsApp.request({
                  url: 'http://localhost:1342/test9',
                  method: 'post',
                  data: {foo: 'bar'}
                }, done);
              },
              function reflect_all_params(done) {
                sailsApp.request({
                  url: 'http://localhost:1342/test10',
                  method: 'post',
                  data: {foo: 'bar', abc: 123}
                }, done);
              }
            ], done);
          });

        });

        describe('lift w/ no hooks besides http and request) ::', function() {

          var curDir, tmpDir, sailsApp;
          var warn;
          var warnings = [];

          this.timeout(0);

          before(function(done) {
            // Cache the current working directory.
            curDir = process.cwd();
            // Create a temp directory.
            tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
            // Switch to the temp directory.
            process.chdir(tmpDir.name);

            // Load the Sails app.
            (new Sails()).lift({
              port: 1342,
              loadHooks: ['http', 'request'],
              log: {level: 'silent'},
              routes: {
                '/test1': function(req, res) { return res.status(200).send(); },
                'GET /test2': function(req, res) { return res.status(200).send(); },
                'POST /test3': function(req, res) { return res.status(200).send(); },
                '/test4/:id': function(req, res) { return res.status(200).send(); },
                '/test5/*': function(req, res) { return res.status(200).send(); },
                'r|test6/\\d+|foo': function(req, res) { return res.status(200).send(); },

                '/test7': function(req, res) { return res.status(200).send('foo'); },
                '/test8': function(req, res) { return res.status(200).json({foo: 'bar'}); },

                'POST /test9': function(req, res) { return res.status(200).send(req.param('foo')); },

                'POST /test10': function(req, res) { return res.status(200).json(req.allParams); },
              }
            }, function(err, _sails) {
              sailsApp = _sails;
              return done(err);
            });
          });

          after(function(done) {
            sailsApp.lower(function() {
              process.chdir(curDir);
              return done();
            });
          });

          it('', function(done) {
            benchmarx('', [
              function route_with_no_verb(done) {
                request.get('http://localhost:1342/test1', done);
              },
              function route_with_GET_verb(done) {
                request.get('http://localhost:1342/test2', done);
              },
              function route_with_POST_verb(done) {
                request({
                  url: 'http://localhost:1342/test3',
                  method: 'post',
                  json: {foo: 'bar'}
                }, done);
              },
              function route_with_dynamic_param(done) {
                request.get('http://localhost:1342/test4/123', done);
              },
              function route_with_wildcard(done) {
                request.get('http://localhost:1342/test5/abc/123', done);
              },
              function route_with_regex(done) {
                request.get('http://localhost:1342/test6/666', done);
              },
              function respond_with_string(done) {
                request.get('http://localhost:1342/test7', done);
              },
              function respond_with_json(done) {
                request.get('http://localhost:1342/test8', done);
              },
              function reflect_one_param(done) {
                request.post('http://localhost:1342/test9', {foo: 'bar'}, done);
              },
              function reflect_all_params(done) {
                request.post('http://localhost:1342/test10', {foo: 'bar', abc: 123}, done);
              }
            ], done);
          });

        });

        describe('lift with all default hooks ::', function() {

          var curDir, tmpDir, sailsApp;
          var warn;
          var warnings = [];

          this.timeout(0);

          before(function(done) {
            // Cache the current working directory.
            curDir = process.cwd();
            // Create a temp directory.
            tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
            // Switch to the temp directory.
            process.chdir(tmpDir.name);
            // Link dependencies so that default hooks will work
            appHelper.linkDeps(tmpDir.name);

            // Load the Sails app.
            (new Sails()).lift({
              port: 1342,
              log: {level: 'silent'},
              routes: {
                '/test1': function(req, res) { return res.status(200).send(); },
                'GET /test2': function(req, res) { return res.status(200).send(); },
                'POST /test3': function(req, res) { return res.status(200).send(); },
                '/test4/:id': function(req, res) { return res.status(200).send(); },
                '/test5/*': function(req, res) { return res.status(200).send(); },
                'r|test6/\\d+|foo': function(req, res) { return res.status(200).send(); },

                '/test7': function(req, res) { return res.status(200).send('foo'); },
                '/test8': function(req, res) { return res.status(200).json({foo: 'bar'}); },

                'POST /test9': function(req, res) { return res.status(200).send(req.param('foo')); },

                'POST /test10': function(req, res) { return res.status(200).json(req.allParams); },
              }
            }, function(err, _sails) {
              sailsApp = _sails;
              return done(err);
            });
          });

          after(function(done) {
            sailsApp.lower(function() {
              process.chdir(curDir);
              return done();
            });
          });

          it('', function(done) {
            benchmarx('', [
              function route_with_no_verb(done) {
                request.get('http://localhost:1342/test1', done);
              },
              function route_with_GET_verb(done) {
                request.get('http://localhost:1342/test2', done);
              },
              function route_with_POST_verb(done) {
                request({
                  url: 'http://localhost:1342/test3',
                  method: 'post',
                  json: {foo: 'bar'}
                }, done);
              },
              function route_with_dynamic_param(done) {
                request.get('http://localhost:1342/test4/123', done);
              },
              function route_with_wildcard(done) {
                request.get('http://localhost:1342/test5/abc/123', done);
              },
              function route_with_regex(done) {
                request.get('http://localhost:1342/test6/666', done);
              },
              function respond_with_string(done) {
                request.get('http://localhost:1342/test7', done);
              },
              function respond_with_json(done) {
                request.get('http://localhost:1342/test8', done);
              },
              function reflect_one_param(done) {
                request.post('http://localhost:1342/test9', {foo: 'bar'}, done);
              },
              function reflect_all_params(done) {
                request.post('http://localhost:1342/test10', {foo: 'bar', abc: 123}, done);
              }
            ], done);
          });

        });

      });
    });
  });

}
