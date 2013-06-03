var async = require('async');
var _ = require('lodash');

/**
 * Load the dependencies and app-specific components
 */
module.exports = function loadSails(configOverride, cb) {

	// Load various pieces of framework
	async.auto({


		config: require('./loadConfig'),		


		models: ['config', 'logger', function (cb) {
			sails.log.verbose('Loading app models...');

			// Load app's model definitions
			// Case-insensitive, using filename to determine identity
			sails.models = sails.modules.optional({
				dirname		: sails.config.paths.models,
				filter		: /(.+)\.(js|coffee)$/
			});
			cb();
		}],


		grunt: ['config', 'logger', function (cb) {
			sails.log.verbose('Loading app Gruntfile...');

			// Now initialize this project's Grunt tasks
			// and execute the environment-specific gruntfile
			sails.spawnGrunt = require('../automation')('default', cb);
		}],


		viewEngine: ['config', 'logger', function (cb) {
			sails.log.verbose('Loading app view engine...');
			/**
			 * Let's keep a copy of the templating engine in the config.
			 * We need this for handlebars in particular so we can register some helper functions.
			 * TODO: this will change in Express 3.x
			 */
			sails.config.viewEngineModule = require(sails.config.viewEngine);
			cb();
		}],


		pubsub: ['config', 'logger', 'models', function (cb) {
			sails.log.verbose('Building pub/sub logic...');

			// Augment models with room/socket logic (& bind context)
			for (var identity in sails.models) {
				sails.models[identity] = _.defaults(sails.models[identity],pubsub);
				_.bindAll(sails.models[identity], 'subscribe', 'introduce', 'unsubscribe', 'publish', 'room', 'publishCreate', 'publishUpdate', 'publishDestroy');
			}
			cb();
		}],


		adapters: ['config', 'logger', 'models', function (cb) {
			sails.log.verbose('Loading app adapters...');

			// Load custom adapters
			// Case-insensitive, using filename to determine identity
			sails.adapters = sails.modules.optional({
				dirname		: sails.config.paths.adapters,
				filter		: /(.+Adapter)\.(js|coffee)$/,
				replaceExpr	: /Adapter/
			});

			// Include default adapters automatically
			// (right now, that's just defaultAdapterName)
			sails.adapters[sails.defaultAdapterModule] = require(sails.defaultAdapterModule);

			cb();
		}],


		orm: ['config', 'models', 'adapters', 'pubsub', function (cb) {
			sails.log.verbose('Loading ORM...');

			// "Resolve" adapters
			// Merge Sails' concept with the actual realities of adapter definitions in npm
			_.each(sails.models, function (model,modelIdentity) {
				_.extend(model,_.clone(resolveAdapter(model.adapter)));
			});

			// Return {} if the adapter is resolved
			function resolveAdapter (adapter, key, depth) {
				if (!depth) depth = 0;
				if (depth > 5) return adapter;

				// Return default adapter if this one is unspecified
				if (!adapter) return resolveAdapter (sails.config.adapters['default'], 'default', depth+1);

				// Try to look up adapter name in registered adapters for this app
				else if (_.isString(adapter)) {
					var lookupAttempt = sails.config.adapters[adapter];
					if (lookupAttempt) {
						return resolveAdapter (lookupAttempt, adapter, depth+1);
					}
					// If it's not a match, go ahead and wrap it in an objcet and return-- this must be a module name
					else return {adapter: adapter};
				}

				// Config was specified as an object
				else if (_.isObject(adapter)) {

					// If 'module' is specified, use that in lieu of the convenience key
					if (adapter.module) adapter.adapter = adapter.module;

					// Otherwise, use the convenience key and hope it's right!
					else adapter.adapter = key;
					return adapter;
				}

				else throw new Error('Unexpected result:  Adapter definition could not be resolved.');
			}

			// Start up waterline (ORM) and pass in adapters and models
			// as well as the sails logger and a copy of the default adapter configuration
			sails.waterline({

				// Let waterline know about our app path
				appPath: sails.config.appPath,

				adapters: sails.adapters,

				collections: sails.models,

				log: sails.log,

				collection: {
					globalize: sails.config.globals.models
				}

			}, function (err, instantiatedModules) {
				if (err) return cb(err);

				// Make instantiated adapters and collections globally accessible
				sails.adapters = instantiatedModules.adapters;
				sails.models = sails.collections = instantiatedModules.collections;

				cb();
			});
		}],


		services: ['orm', function (cb) {
			sails.log.verbose('Loading app services...');

			// Load app's service modules (case-insensitive)
			sails.services = sails.modules.optional({
				dirname		: sails.config.paths.services,
				filter		: /(.+)\.(js|coffee)$/,
				caseSensitive: true
			});
			cb();
		}],


		globals: ['services', function (cb) {
			sails.log.verbose('Creating global variables...');

			// Provide global access (if allowed in config)
			if (sails.config.globals._) global['_'] = _;
			if (sails.config.globals.async) global['async'] = async;

			if (sails.config.globals.services) {
				_.each(sails.services,function (service,identity) {
					var globalName = service.globalId || service.identity;
					global[globalName] = service;
				});
			}

			cb();
		}],


		controllers: ['orm', function (cb) {
			sails.log.verbose('Loading app controllers...');

			// Load app controllers
			sails.controllers = sails.modules.optional({
				dirname		: sails.config.paths.controllers,
				filter		: /(.+)Controller\.(js|coffee)$/,
				replaceExpr	: /Controller/
			});

			// Get federated controllers where actions are specified each in their own file
			var federatedControllers = sails.modules.optional({
				dirname			: sails.config.paths.controllers,
				pathFilter		: /(.+)\/(.+)\.(js|coffee)$/
			});
			sails.controllers = _.extend(sails.controllers,federatedControllers);

			cb();
		}],


		policies: ['orm', function (cb) {
			sails.log.verbose('Loading app policies...');

			// Load policy modules
			sails.policies = sails.modules.optional({
				dirname		: sails.config.paths.policies,
				filter		: /(.+)\.(js|coffee)$/,
				replaceExpr	: null
			});
			cb();
		}],


		bootstrap: ['orm', 'globals', function (cb) {
			sails.log.verbose('Running app bootstrap...');

			// Run boostrap script if specified
			var boostrapWarningTimer;
			if (sails.config.bootstrap) {
				var boostrapDefaultTimeout = 2000;
				boostrapWarningTimer = setTimeout(function() {
					sails.log.warn("Bootstrap is taking unusually long to execute "+
						"its callback (" + boostrapDefaultTimeout + "ms).\n"+
						"Perhaps you forgot to call it?  The callback is the first argument of the function.");
				}, boostrapDefaultTimeout);
				sails.config.bootstrap(function (err) {
					boostrapWarningTimer && clearTimeout(boostrapWarningTimer);
					if (err) return cb(err);
					return cb();
				});
			}
			// Otherwise, don't
			else cb();
		}]

	}, function (err) {
		if (err) {
			sails.log.error('Error encountered while loading Sails!');
			sails.log.error(err);
			return cb(err);
		}
		sails.log.verbose('Sails loaded successfully.');
		cb();
	});
};