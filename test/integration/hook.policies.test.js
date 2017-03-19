/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('@sailshq/lodash');
var async = require('async');

var Filesystem = require('machinepack-fs');

var Sails = require('../../lib').constructor;

tmp.setGracefulCleanup();


describe('policies :: ', function() {

  describe('basic usage :: ', function() {

    var curDir, tmpDir;

    before(function() {
      // Cache the current working directory.
      curDir = process.cwd();
      // Create a temp directory.
      tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      Filesystem.writeSync({
        force: true,
        destination: 'api/policies/err.js',
        string: 'module.exports = function(req, res, next) {return res.serverError(\'Test Error\');}'
      }).execSync();

    });

    after(function() {
      process.chdir(curDir);
    });

    it('should load policies from disk and merge them with programmatically added policies', function(done) {

      (new Sails()).load({
        hooks: {
          grunt: false, views: false, pubsub: false
        },
        blueprints: {
          actions: false,
          rest: false,
          shortcuts: false
        },
        log: {level: 'silent'},
        controllers: {},
        routes: {},
        policies: {
          moduleDefinitions: {
            'foo': function(req, res, next) {return res.serverError('foo');}
          },
        }
      }, function(err, sailsApp) {
        if (err) { return done(err); }
        assert.equal(_.keys(sailsApp.hooks.policies.middleware).length, 2);
        assert(sailsApp.hooks.policies.middleware.foo);
        assert(sailsApp.hooks.policies.middleware.err);
        return done();
      });
    });

    describe('error policies :: ', function() {

      var sailsApp;
      var policyMap = {};

      beforeEach(function(done) {
        (new Sails()).load({
          hooks: {
            grunt: false, views: false, pubsub: false
          },
          blueprints: {
            actions: false,
            rest: false,
            shortcuts: false
          },
          log: {level: 'silent'},
          controllers: {
            moduleDefinitions: {
              'user': function(req, res) { return res.send('user'); },
              'user/foo': function(req, res) { return res.send('user.foo'); },
              'user/foo/bar': function(req, res) { return res.send('user.foo.bar'); }
            }
          },
          routes: {
            '/user': 'user',
            '/user-foo': 'user/foo',
            '/user-foo-bar': 'user/foo/bar'
          },
          policies: policyMap


        }, function(err, _sails) {
          if (err) { return done(err); }
          sailsApp = _sails;
          return done();
        });
      });

      afterEach(function(done){
        if (sailsApp) {sailsApp.lower(done);}
        else {
          return done();
        }
      });

      describe('with a single, defined "error" policy mapped to user/*', function() {

        before(function() {
          policyMap = { 'user/*': ['err'] };
        });

        it('the policy should apply to all user/* actions', function(done) {

          async.each(['/user', '/user-foo', '/user-foo-bar'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (!err) {
                return cb(new Error('For URL ' + url + ', expected server error, got: ' + data));
              }
              assert.equal(err.body, 'Test Error');
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

      });

      describe('with a `false` policy mapped to user/*', function() {

        before(function() {
          policyMap = { 'user/*': false };
        });

        it('the policy should apply to all user/* actions', function(done) {

          async.each(['/user', '/user-foo', '/user-foo-bar'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (!err) {
                return cb(new Error('For URL ' + url + ', expected server error, got: ' + data));
              }
              assert.equal(err.status, 403);
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

      });

      describe('with a defined "error" policy mapped to user/* and a "blank" policy mapped to user/foo', function() {

        before(function() {
          policyMap = {
            'user/*': ['err'],
            'user/Foo': [] // <-- Note the uppercase F -- this should not matter.
          };
        });

        it('the policy should apply to actions `user` and `user/foo/bar`', function(done) {

          async.each(['/user', '/user-foo-bar'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (!err) {
                return cb(new Error('For URL ' + url + ', expected server error, got: ' + data));
              }
              assert.equal(err.body, 'Test Error');
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

        it('the policy should NOT apply to actions `user/foo`', function(done) {

          sailsApp.request({
            url: '/user-foo',
            method: 'GET'
          }, function (err, response, data) {
            if (err) {
              return done(new Error('For URL /user-foo, expected "user-foo", got: ' + err));
            }
            assert.equal(data, 'user.foo');
            return done();
          });

        });

      });

      describe('with a defined "error" policy mapped to user/* and a `true` policy mapped to user/foo', function() {

        before(function() {
          policyMap = {
            'user/*': ['err'],
            'user/foo': true
          };
        });

        it('the policy should apply to actions `user` and `user/foo/bar`', function(done) {

          async.each(['/user', '/user-foo-bar'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (!err) {
                return cb(new Error('For URL ' + url + ', expected server error, got: ' + data));
              }
              assert.equal(err.body, 'Test Error');
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

        it('the policy should NOT apply to actions `user/foo`', function(done) {

          sailsApp.request({
            url: '/user-foo',
            method: 'GET'
          }, function (err, response, data) {
            if (err) {
              return cb(new Error('For URL ' + url + ', expected "user-foo", got: ' + err));
            }
            assert.equal(data, 'user.foo');
            return done();
          });

        });

      });


      describe('with a defined "error" policy mapped to * and a `true` policy mapped to user/foo', function() {

        before(function() {
          policyMap = {
            '*': ['err'],
            'user/foo': true
          };
        });

        it('the policy should apply to actions `user` and `user/foo/bar`', function(done) {

          async.each(['/user', '/user-foo-bar'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (!err) {
                return cb(new Error('For URL ' + url + ', expected server error, got: ' + data));
              }
              assert.equal(err.body, 'Test Error');
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

        it('the policy should NOT apply to actions `user/foo`', function(done) {

          sailsApp.request({
            url: '/user-foo',
            method: 'GET'
          }, function (err, response, data) {
            if (err) {
              return done(new Error('For URL /user-foo, expected "user-foo", got: ' + err));
            }
            assert.equal(data, 'user.foo');
            return done();
          });

        });

      });

      describe('with a defined "error" policy mapped to user/* and a "blank" policy mapped to user/foo/*', function() {

        before(function() {
          policyMap = {
            'user/*': ['err'],
            'user/foo/*': []
          };
        });

        it('the policy should apply to actions `user`', function(done) {

          async.each(['/user'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (!err) {
                return cb(new Error('For URL ' + url + ', expected server error, got: ' + data));
              }
              assert.equal(err.body, 'Test Error');
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

        it('the policy should NOT apply to actions `user/foo`', function(done) {

          sailsApp.request({
            url: '/user-foo',
            method: 'GET'
          }, function (err, response, data) {
            if (err) {
              return cb(new Error('For URL ' + url + ', expected "user-foo", got: ' + err));
            }
            assert.equal(data, 'user.foo');
            return done();
          });

        });

        it('the policy should NOT apply to actions `user/foo/bar`', function(done) {

          sailsApp.request({
            url: '/user-foo-bar',
            method: 'GET'
          }, function (err, response, data) {
            if (err) {
              return cb(new Error('For URL ' + url + ', expected "user-foo-bar", got: ' + err));
            }
            assert.equal(data, 'user.foo.bar');
            return done();
          });

        });

      });


    });

    describe('pass-thru policies', function() {

      var sailsApp;
      var policyMap = {};

      beforeEach(function(done) {
        (new Sails()).load({
          hooks: {
            grunt: false, views: false, pubsub: false
          },
          blueprints: {
            actions: false,
            rest: false,
            shortcuts: false
          },
          log: {level: 'silent'},
          controllers: {
            moduleDefinitions: {
              'user': function(req, res) { return res.json({action: 'user', animals: {cat: req.options.cat, owl: req.options.owl}}); },
              'user/foo': function(req, res) { return res.json({action: 'user.foo', animals: {cat: req.options.cat, owl: req.options.owl}}); },
              'user/foo/bar': function(req, res) { return res.json({action: 'user.foo.bar', animals: {cat: req.options.cat, owl: req.options.owl}}); },
              'user/foo/baz': function(req, res) { throw new Error('should never be reached!'); }
            }
          },
          routes: {
            '/user': 'user',
            '/user-foo': 'user/foo',
            '/user-foo-bar': 'user/foo/bar',
            '/user-foo-baz': 'user/foo/baz'
          },
          policies: _.extend({
            moduleDefinitions: {
              'add-owl': function(req, res, next) {req.options.owl = 'hoot'; return next();},
              'add-cat': function(req, res, next) {req.options.cat = 'meow'; return next();}
            },
          },policyMap)


        }, function(err, _sails) {
          if (err) { return done(err); }
          sailsApp = _sails;
          return done();
        });
      });

      afterEach(function(done){
        if (sailsApp) {sailsApp.lower(done);}
        else {
          return done();
        }
      });

      describe('with a single, defined "pass-thru" policy mapped to user.*', function() {

        before(function() {
          policyMap = { 'user/*': ['add-owl'] };
        });

        it('the policy should apply to all user/* actions', function(done) {

          async.each(['/user', '/user-foo', '/user-foo-bar'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (err) {
                return cb(new Error('For URL ' + url + ', expected successful response, got: ' + err));
              }
              assert.equal(data.action, url.substr(1).replace(/-/g,'.'));
              assert.equal(data.animals.owl, 'hoot');
              assert(_.isUndefined(data.animals.cat));
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

      });

      describe('with two defined "pass-thru" policies chained to user/*', function() {

        before(function() {
          policyMap = { 'user/*': ['add-owl', 'add-cat'] };
        });

        it('the policies should apply to all user/* actions', function(done) {

          async.each(['/user', '/user-foo', '/user-foo-bar'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (err) {
                return cb(new Error('For URL ' + url + ', expected successful response, got: ' + err));
              }
              assert.equal(data.action, url.substr(1).replace(/-/g,'.'));
              assert.equal(data.animals.owl, 'hoot');
              assert.equal(data.animals.cat, 'meow');
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

      });

      describe('with the "add-owl" policy on user/*, and "add-cat" on user/foo/bar', function() {

        before(function() {
          policyMap = { 'user/*': ['add-owl'], 'user/foo/bar': ['add-cat'] };
        });

        it('the "add-owl" policy (and NOT the "add-cat" policy) should apply to the "user" and "user/foo" actions', function(done) {

          async.each(['/user', '/user-foo'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (err) {
                return cb(new Error('For URL ' + url + ', expected successful response, got: ' + err));
              }
              assert.equal(data.action, url.substr(1).replace(/-/g,'.'));
              assert.equal(data.animals.owl, 'hoot');
              assert(_.isUndefined(data.animals.cat));
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });
        });

        it('the "add-cat" policy (and NOT the "add-owl" policy) should apply to the "user/foo/bar" action', function(done) {

          sailsApp.request({
            url: '/user-foo-bar',
            method: 'GET'
          }, function (err, response, data) {
            if (err) {
              return cb(new Error('For URL ' + url + ', expected successful response, got: ' + err));
            }
            assert.equal(data.action, 'user.foo.bar');
            assert.equal(data.animals.cat, 'meow');
            assert(_.isUndefined(data.animals.owl));
            return done();
          });

        });

      });

      describe('(using controller config) with the "add-owl" policy on user/*, and "add-cat" on user/foo/bar', function() {

        before(function() {
          policyMap = {
            'User': {
              '*': 'add-OWL', // Capitalization shouldn't matter for policy name...
              'foo': ['add-cat']
            },
            'user/FooController': {
              '*': false,
              'Bar': 'add-cat' // Capitalization shouldn't matter for action name...
            }
          };
        });

        it('the "add-owl" policy (and NOT the "add-cat" policy) should apply to the "user" action', function(done) {

          sailsApp.request({
            url: '/user',
            method: 'GET'
          }, function (err, response, data) {
            if (err) {
              return done(new Error('For URL \'/user\', expected successful response, got: ' + err));
            }
            assert.equal(data.action, 'user');
            assert.equal(data.animals.owl, 'hoot');
            assert(_.isUndefined(data.animals.cat));
            return done();
          });

        });

        it('the "add-cat" policy (and NOT the "add-owl" policy) should apply to the "user/foo" and "user/foo/bar" actions', function(done) {

          async.each(['/user-foo', '/user-foo-bar'], function(url, cb) {
            sailsApp.request({
              url: url,
              method: 'GET'
            }, function (err, response, data) {
              if (err) {
                return cb(new Error('For URL ' + url + ', expected successful response, got: ' + err));
              }
              assert.equal(data.action, url.substr(1).replace(/-/g,'.'));
              assert.equal(data.animals.cat, 'meow');
              assert(_.isUndefined(data.animals.owl));
              return cb();
            });

          }, function (err) {
            if (err) {return done(err);}
            return done();
          });

        });

        it('the "user/foo/baz" route should always return "Forbidden"', function(done) {

          sailsApp.request({
            url: '/user-foo-baz',
            method: 'GET'
          }, function (err, response, data) {
            if (!err) {
              return done(new Error('For URL \'/user/foo/baz\', expected server error, got: ' + data));
            }
            assert.equal(err.status, 403);
            return done();
          });

        });

      });

    });


    describe('Adding policies directly to routes', function() {

      var sailsApp;
      var policyMap = {};

      before(function(done) {
        (new Sails()).load({
          hooks: {
            grunt: false, views: false, pubsub: false
          },
          blueprints: {
            actions: false,
            rest: false,
            shortcuts: false
          },
          log: {level: 'silent'},
          controllers: {
            moduleDefinitions: {
              'user': function(req, res) { return res.json({action: 'user', foo: req.options.foo, animals: {cat: req.options.cat, owl: req.options.owl}}); },
              'user/foo': function(req, res) { return res.json({action: 'user/foo', foo: req.options.foo,  animals: {cat: req.options.cat, owl: req.options.owl}}); },
              'user/foo/bar': function(req, res) { return res.json({action: 'user/foo/bar', foo: req.options.foo, animals: {cat: req.options.cat, owl: req.options.owl}}); }
            }
          },
          routes: {
            '/user': [{ policy: 'add-owl', foo: 'bar' }, 'user'],
            '/user-foo': [{ policy: 'add-cat' }, 'user/foo'],
            '/user-foo-bar': [ { policy: 'add-owl'}, { policy: 'add-cat' }, 'user/foo/bar']
          },
          policies: _.extend({
            moduleDefinitions: {
              'add-owl': function(req, res, next) {req.options.owl = 'hoot'; return next();},
              'add-cat': function(req, res, next) {req.options.cat = 'meow'; return next();}
            },
          },policyMap)


        }, function(err, _sails) {
          if (err) { return done(err); }
          sailsApp = _sails;
          return done();
        });
      });

      after(function(done){
        if (sailsApp) {sailsApp.lower(done);}
        else {
          return done();
        }
      });

      it('should add the correct policy to `/user` and retain extra options', function(done) {

        sailsApp.request({
          url: '/user',
          method: 'GET'
        }, function (err, response, data) {
          if (err) {
            return cb(new Error('For URL ' + url + ', expected successful response, got: ' + err));
          }
          assert.equal(data.action, 'user');
          assert.equal(data.animals.owl, 'hoot');
          assert(_.isUndefined(data.animals.cat));
          assert.equal(data.foo, 'bar');
          return done();
        });

      });

      it('should add the correct policy to `/user-foo`', function(done) {

        sailsApp.request({
          url: '/user-foo',
          method: 'GET'
        }, function (err, response, data) {
          if (err) {
            return cb(new Error('For URL ' + url + ', expected successful response, got: ' + err));
          }
          assert.equal(data.action, 'user/foo');
          assert.equal(data.animals.cat, 'meow');
          assert(_.isUndefined(data.animals.owl));
          assert(_.isUndefined(data.foo));
          return done();
        });

      });

      it('should add the correct policies to `/user-foo-bar`', function(done) {

        sailsApp.request({
          url: '/user-foo-bar',
          method: 'GET'
        }, function (err, response, data) {
          if (err) {
            return cb(new Error('For URL ' + url + ', expected successful response, got: ' + err));
          }
          assert.equal(data.action, 'user/foo/bar');
          assert.equal(data.animals.cat, 'meow');
          assert.equal(data.animals.owl, 'hoot');
          assert(_.isUndefined(data.foo));
          return done();
        });

      });

    });


  });

  describe('with invalid configuration :: ', function() {

    describe('when a non-function policy is specified on disk', function() {

      var curDir, tmpDir;

      before(function(done) {

        // Cache the current working directory.
        curDir = process.cwd();
        // Create a temp directory.
        tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
        // Switch to the temp directory.
        process.chdir(tmpDir.name);

        Filesystem.writeSync({
          force: true,
          destination: 'api/policies/err.js',
          string: 'module.exports = {"foo": "bar"}'
        }).execSync();

        return done();
      });

      after(function() {
        process.chdir(curDir);
      });

      it('Sails should fail to lift', function(done) {

        (new Sails()).load({
          hooks: {
            grunt: false, views: false, pubsub: false
          },
          log: {level: 'silent'}
        }, function(err, sailsApp) {
          if (!err) {
            sailsApp.lower(function() {
              return done(new Error('Expected error lifting, but didn\'t get one!'));
            });
          }
          return done();
        });

      });

    });

    describe('when a non-function policy is specified programmatically', function() {

      it('Sails should fail to lift', function(done) {

        (new Sails()).load({
          hooks: {
            grunt: false, views: false, pubsub: false, orm: false
          },
          log: {level: 'silent'},
          policies: {
            moduleDefinitions: {
              foo: 'bar'
            }
          }
        }, function(err, sailsApp) {
          if (!err) {
            sailsApp.lower(function() {
              return done(new Error('Expected error lifting, but didn\'t get one!'));
            });
          }
          return done();
        });

      });

    });


  });

});
