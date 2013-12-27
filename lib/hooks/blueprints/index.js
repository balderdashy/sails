/**
 * Module dependencies
 */
var _ = require('lodash');
var async = require('async');
var pluralize = require('pluralize');
var util = require('sails-util');




module.exports = function(sails) {	

	/**
	 * Expose blueprint hook definition
	 */
	return {
		defaults: {

			blueprints: {

				// Blueprint/Shadow-Routes Enabled
				// 
				// e.g. '/frog/jump': 'FrogController.jump'
				actions: true,
				// e.g. '/frog': 'FrogController.index'
				index: true,
				// e.g. '/frog/find/:id?': 'FrogController.find'
				shortcuts: true,
				// e.g. 'get /frog/:id?': 'FrogController.find'
				rest: true,



				// Blueprint/Shadow-Route Modifiers
				// 
				// e.g. 'get /api/v2/frog/:id?': 'FrogController.find'
				prefix: '',
				// e.g. 'get /frogs': 'FrogController.find'
				pluralize: false,




				// Blueprint Middleware
				//
				// Skip blueprint if `:id?` is NOT an integer.
				expectIntegerId: false, 
				// Enable JSONP callbacks.
				jsonp: false
			}

		},
		


		/**
		 * Initialize is fired first thing when the hook is loaded.
		 * 
		 * @param  {Function} cb
		 */
		initialize: function (cb) {

			// Set up listeners to bind shadow routes at the appropriate times.
			var eventsToWaitFor = [];
			// Wait until router is ready.
			eventsToWaitFor.push('router:after');
			// If policies hook is enabled, also wait until policies are bound.
			if (sails.hooks.policies) {
				eventsToWaitFor.push('hook:policies:bound');
			}
			waitForAll(eventsToWaitFor, bindShadowRoutes);

			// Load blueprint middleware and continue.
			loadMiddleware(this, cb);
		}

	};







	/**
	 * bindBlueprint
	 *
	 * @return {[Function]} an array of two middleware:
	 *   1. sets `req.target`, configured by closure
	 *   2. the blueprint itself
	 *
	 * TODO:
	 * This could certainly be optimized for performance, but also simplified
	 * so it's easier to pick up for hook developers (and easier to maintain for papa bear.)
	 * 
	 * @param  {String} controllerId
	 * @param  {String} actionId
	 */
	function bindBlueprint (controllerId, actionId) {
		return [function wrapperFn (req, res, next) {

			// Track the controller/action target
			// (grab from the path params)
			req.target = {
				controller: controllerId,
				action: actionId
			};

			next();

		}].concat(sails.blueprints[actionId]);
	}
	



	/**
	 * Bind blueprint/shadow routes to handle all controller actions.
	 */
	function bindShadowRoutes () {

		_.each(sails.controllers, function eachController (controller, controllerId) {
			if (!util.isDictionary(controller)) return;
			
			// Determine controller's config, actions, and base route.
			var conf = util.merge({}, sails.config.blueprints, controller._config || {});
			var actions = _.functions(sails.controllers[controllerId]);
			var baseRoute = conf.prefix + '/' + controllerId;
			if (conf.pluralize) {
				baseRoute = pluralize(baseRoute);
			}

			// Bind "actions" and "index" shadows
			_.each(actions, function eachActionID (actionId) {
				var actionHandler = bindBlueprint(controllerId, actionId);

				// Bind action route, if enabled
				if (conf.actions) {
					var actionRoute = baseRoute + '/' + actionId.toLowerCase() + '/:id?';
					sails.router.bind(actionRoute, actionHandler);
				}

				// Bind index route, if enabled
				if (conf.index && actionId.match(/^index$/i)) {
					sails.router.bind(baseRoute, actionHandler);
				}
			});

			// Bind "rest" shadows
			if ( conf.rest ) {
				sails.log.silly('Binding RESTful shadows for controller:',controllerId);
				sails.router.bind('get ' + baseRoute + '/:id?', bindBlueprint(controllerId, 'find'));
				sails.router.bind('post ' + baseRoute, bindBlueprint(controllerId, 'create'));
				sails.router.bind('put ' + baseRoute + '/:id?', bindBlueprint(controllerId, 'update'));
				sails.router.bind('delete ' + baseRoute + '/:id?', bindBlueprint(controllerId, 'destroy'));
			}

			// Bind URL-bar "shortcuts"
			// (NOTE: these may be superceded by embedding actions in generated controllers)
			if ( conf.shortcuts ) {
				sails.log.silly('Binding shortcut shadows for controller:',controllerId);
				sails.router.bind(baseRoute + '/find/:id?', bindBlueprint(controllerId, 'find'));
				sails.router.bind(baseRoute + '/create', bindBlueprint(controllerId, 'create'));
				sails.router.bind(baseRoute + '/update/:id?', bindBlueprint(controllerId, 'update'));
				sails.router.bind(baseRoute + '/destroy/:id?', bindBlueprint(controllerId, 'destroy'));
			}
		});
	}



	/**
	 * (Re)load middleware.
	 *
	 * @api private
	 */
	function loadMiddleware (hook, cb) {
		sails.log.verbose('Loading blueprint middleware...');
		sails.modules.loadBlueprints(function modulesLoaded (err, modules) {
			if (err) return cb(err);

			// Partially apply the blueprint middleware to 'seed' it w/ access to `sails` global.
			// (TODO: change how this works)
			modules = _.mapValues(modules, function (module) {
				return module(sails);
			});

			// Save reference to blueprints middleware in hook.
			hook.middleware = modules;

			// Also expose `sails.blueprints`.
			sails.blueprints = hook.middleware;


			return cb(err);
		});
	}



	/**
	 * Wait until dependency conditions have been satisfied
	 *
	 * @param {Array} events - `sails.on()` events to wait for
	 * @param {Function} cb
	 *
	 * @api private
	 */

	function waitForAll (events, cb) {

		// Waiting to lift guard until all these events have fired
		var dependencies = [];
		_.each(events, function (event) {
			dependencies.push(function waitFor (cb) {
				return sails.on(event, cb);
			});					
		});


		// All conditions satisfied; binding routes...
		async.auto(dependencies, function conditionsSatisfied (err) {
			return cb(err);
		});
	}
};

