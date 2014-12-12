/**
 * Stub custom hooks for use in tests.
 *
 * @type {Object}
 */
module.exports = {

	// Extremely simple hook that doesn't do anything.
	NOOP: function (sails) {
		return { identity: 'noop' };
	},

	// Depends on 'noop' hook
	NOOP2: function (sails) {
		return {
			// TODO: indicate dependency on 'noop' hook
			identity: 'noop2'
		};
	},

	// Deliberately rotten hook- it throws.
	SPOILED_HOOK: function (sails) {
		throw new Error('smells nasty');
	},

  // Hook to test `defaults` object
  DEFAULTS_OBJ: function(sails) {
    return {
      identity: 'defaults_obj',
      defaults: {
        foo: 'bar',
        inky: {
          dinky: 'doo',
          pinky: 'dont'
        }
      }
    };
  },

  // Hook to test `defaults` function
  DEFAULTS_FN: function(sails) {
    return {
      identity: 'defaults_fn',
      defaults: function() {
        return {
          foo: 'bar',
          inky: {
            dinky: 'doo',
            pinky: 'dont'
          }
        };
      }
    };
  },

  // Hook to test `initialize` function
  INIT_FN: function(sails) {
    return {
      identity: 'init_fn',
      initialize: function(cb) {
        sails.config.hookInitLikeABoss = true;
        return cb();
      }
    };
  },

  // Hook to test `configure` function
  CONFIG_FN: function(sails) {
    return {
      identity: 'config_fn',
      configure: function() {
        // Test that loaded config is available by copying a value
        sails.config.hookConfigLikeABoss = sails.config.testConfig;
      }
    };
  },

  // Hook to test `routes` function
  ROUTES: function(sails) {
    return {
      identity: 'routes',
      routes: {
        before: {
          "GET /foo": function(req, res, next) {
            sails.config.foo = "a";
            next();
          }
        },
        after: {
          "GET /foo": function(req, res, next) {
            sails.config.foo = sails.config.foo + "c";
            res.send(sails.config.foo);
          }
        }
      }
    };
  },

  // Hook to test `routes` function
  ADVANCED_ROUTES: function(sails) {
    return {
      identity: 'advanced_routes',
      initialize: function(cb) {
        sails.on('router:before', function() {
          sails.router.bind('GET /foo', function(req, res, next) {
            sails.config.foo = sails.config.foo + "b";
            next();
          });
        });
        sails.on('router:after', function() {
          sails.router.bind('GET /foo', function(req, res, next) {
            sails.config.foo = sails.config.foo + "e";
            res.send(sails.config.foo);
          });
        });
        cb();
      },
      routes: {
        before: {
          "GET /foo": function(req, res, next) {
            sails.config.foo = "a";
            next();
          }
        },
        after: {
          "GET /foo": function(req, res, next) {
            sails.config.foo = sails.config.foo + "d";
            next();
          }
        }
      }
    };
  },

};
