/**
 * Module dependencies
 */
var should = require('should');
var assert = require('assert');
var _ = require('@sailshq/lodash');

var constants = require('../fixtures/constants');
var customHooks = require('../fixtures/customHooks');

var $Sails = require('../helpers/sails');

// TIP:
//
// To get a hold of the `sails` instance as a closure variable
// (i.e. if you're tired of using the mocha context):
// var sails;
// $Sails.get(function (_sails) { sails = _sails; });


describe('app.initializeHooks()', function() {

  describe('with no hooks', function() {
    var sails = $Sails.load.withAllHooksDisabled();
    it('hooks should be exposed on the `sails` global', function() {
      sails.hooks.should.be.an.Object;
    });
  });



  describe('with all core hooks and default config', function() {
    var sails = $Sails.load();
    it('should expose hooks on the `sails` global', function() {
      sails.hooks.should.be.an.Object;
    });
    it('should expose at least the expected core hooks', function() {
      var intersection = _.intersection(_.keys(sails.hooks), _.keys(constants.EXPECTED_DEFAULT_HOOKS));

      // If i18n is missing, that might be ok-- but just check to be sure sails.config.i18n.locales is `[]`.
      // (i.e. it must have turned itself off)
      if (!_.contains(intersection, 'i18n')) {
        assert(_.isEqual(sails.config.i18n.locales, []), 'i18n.locales config must be [] in this situation');
      }

      assert.deepEqual(intersection, _.without(_.keys(constants.EXPECTED_DEFAULT_HOOKS), 'i18n'),  'Missing expected default hooks');
    });
  });

  describe('with the grunt hook set to boolean false', function() {
    var sails = $Sails.load({hooks: {grunt: false}});
    it('should expose hooks on the `sails` global', function() {
      sails.hooks.should.be.an.Object;
    });
    it('should expose all the core hooks except for Grunt', function() {
      var intersection = _.intersection(_.keys(sails.hooks), _.keys(constants.EXPECTED_DEFAULT_HOOKS));
      assert.deepEqual(intersection, _.without(_.keys(constants.EXPECTED_DEFAULT_HOOKS), 'grunt', 'i18n'),  'Missing expected default hooks');
    });
  });

  describe('with the grunt hook set to the string "false"', function() {
    var sails = $Sails.load({hooks: {grunt: "false"}});
    it('should expose hooks on the `sails` global', function() {
      sails.hooks.should.be.an.Object;
    });
    it('should expose all the core hooks except for Grunt', function() {
      var intersection = _.intersection(_.keys(sails.hooks), _.keys(constants.EXPECTED_DEFAULT_HOOKS));
      assert.deepEqual(intersection, _.without(_.keys(constants.EXPECTED_DEFAULT_HOOKS), 'grunt', 'i18n'),  'Missing expected default hooks');
    });
  });




  describe('configured with a custom hook called `noop`', function() {
    var sails = $Sails.load({
      hooks: {
        noop: customHooks.NOOP
      }
    });

    it('should expose `noop`', function() {
      sails.hooks.should.have
        .property('noop');
    });
    it('should also expose the expected core hooks', function() {
      var intersection = _.intersection(Object.keys(sails.hooks), _.keys(constants.EXPECTED_DEFAULT_HOOKS));
      assert.deepEqual(intersection, _.without(_.keys(constants.EXPECTED_DEFAULT_HOOKS), 'i18n'),  'Missing expected default hooks');
    });
  });



  describe('configured with a hook (`noop2`), but not its dependency (`noop`)', function() {
    var sails = $Sails.load.expectFatalError({
      hooks: {

        // This forced failure is only temporary--
        // very hard to test right now as things stand.
        whadga: function(sails) {
          throw 'temporary forced failure to simulate dependency issue';
        },

        noop2: customHooks.NOOP2
      }
    });
  });



  describe('configured with a hook that always throws', function() {
    var sails = $Sails.load.expectFatalError({
      hooks: {
        // This forced failure is only temporary--
        // very hard to test right now as things stand.
        badHook: customHooks.SPOILED_HOOK
      }
    });
  });


  describe('configured with a custom hook with a `defaults` object', function() {
    var sails = $Sails.load({
      hooks: {
        defaults_obj: customHooks.DEFAULTS_OBJ
      },
      inky: {
        pinky: 'boo'
      }
    });

    it('should add a `foo` key to sails config', function() {
      assert(sails.config.foo === 'bar');
    });
    it('should add an `inky.dinky` key to sails config', function() {
      assert(sails.config.inky.dinky === 'doo');
    });
    it('should keep the existing `inky.pinky` key to sails config', function() {
      assert(sails.config.inky.pinky === 'boo');
    });

  });

  describe('configured with a custom hook with a `defaults` function', function() {
    var sails = $Sails.load({
      hooks: {
        defaults_fn: customHooks.DEFAULTS_FN
      },
      inky: {
        pinky: 'boo'
      }
    });

    it('should add a `foo` key to sails config', function() {
      assert(sails.config.foo === 'bar');
    });
    it('should add an `inky.dinky` key to sails config', function() {
      assert(sails.config.inky.dinky === 'doo');
    });
    it('should keep the existing `inky.pinky` key to sails config', function() {
      assert(sails.config.inky.pinky === 'boo');
    });

  });

  describe('configured with a custom hook with a `configure` function', function() {
    var sails = $Sails.load({
      hooks: {
        config_fn: customHooks.CONFIG_FN
      },
      testConfig: 'oh yeah!'
    });

    it('should add a `hookConfigLikeABoss` key to sails config', function() {
      assert(sails.config.hookConfigLikeABoss === 'oh yeah!');
    });

  });

  describe('configured with a custom hook with an `initialize` function', function() {
    var sails = $Sails.load({
      hooks: {
        init_fn: customHooks.INIT_FN
      }
    });

    it('should add a `hookInitLikeABoss` key to sails config', function() {
      assert(sails.config.hookInitLikeABoss === true);
    });

  });


  describe('configured with a custom hook with a `routes` object', function() {
    var sails = $Sails.load({
      hooks: {
        routes: customHooks.ROUTES
      },
      routes: {
        "GET /foo": function(req, res, next) {sails.config.foo += "b"; return next();}
      }
    });

    it('should add two `/foo` routes to the sails config', function() {
      var fooRoutes = 0;
      _.each(sails.router._privateRouter.stack, function(stack){
        if(stack.route.path === '/foo' && stack.route.methods.get === true){
          fooRoutes += 1;
        }
      });
      assert(fooRoutes === 3);
    });

    it('should bind the routes in the correct order', function(done) {
      sails.request({
        method: 'get',
        url: '/foo'
      }, function (err, res, body) {
        if (err) return done(err);
        assert.equal(res.statusCode, 200);
        assert.equal(body, 'abc');
        return done();
      });
    });

  });

  describe('configured with a custom hook with advanced routing', function() {
    var sails = $Sails.load({
      hooks: {
        advanced_routes: customHooks.ADVANCED_ROUTES
      },
      routes: {
        "GET /foo": function(req, res, next) {sails.config.foo += "c"; return next();}
      }
    });

    it('should add four `/foo` routes to the sails config', function() {
      var fooRoutes = 0;
      _.each(sails.router._privateRouter.stack, function(stack){
        if(stack.route.path === '/foo' && stack.route.methods.get === true){
          fooRoutes += 1;
        }
      });
      assert(fooRoutes === 5);
    });

    it('should bind the routes in the correct order', function(done) {
      sails.request({
        method: 'get',
        url: '/foo'
      }, function (err, res, body) {
        if (err) return done(err);
        assert.equal(res.statusCode, 200);
        assert.equal(body, 'abcde');
        return done();
      });
    });

  });

  // describe('configured with a circular hook dependency', function () {

  //  // NOTE #1: not currently implemented
  //  // NOTE #2: not currently possible
  //  // (should be possible after merging @ragulka's PR)
  //  // $Sails.load();

  //  it('should throw a fatal error');
  // });


});
