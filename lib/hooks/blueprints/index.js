/**
 * Module dependencies
 */
var _ = require('lodash');
var async = require('async');
var pluralize = require('pluralize');
var util = require('sails-util');



/**
 * Blueprints (Core Hook)
 *
 * Stability: 1 - Experimental
 * (see http://nodejs.org/api/documentation.html#documentation_stability_index)
 */
module.exports = function(sails) {	

	var hook;

	/**
	 * Expose blueprint hook definition
	 */
	return {

		/**
		 * Default configuration to merge w/ top-level `sails.config`
		 * @type {Object}
		 */
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

			// Provide hook context to closures
			hook = this;

			// Set up listener to bind shadow routes when the time is right.
			// 
			// Always wait until after router has bound static routes.
			// If policies hook is enabled, also wait until policies are bound.
			// If orm hook is enabled, also wait until models are known.
			// If controllers hook is enabled, also wait until controllers are known.
			var eventsToWaitFor = [];
			eventsToWaitFor.push('router:after');
			if (sails.hooks.policies) {
				eventsToWaitFor.push('hook:policies:bound');
			}
			if (sails.hooks.orm) {
				eventsToWaitFor.push('hook:orm:loaded');
			}
			if (sails.hooks.controllers) {
				eventsToWaitFor.push('hook:controllers:loaded');
			}
			waitForAll(eventsToWaitFor, bindShadowRoutes);

			// Load blueprint middleware and continue.
			loadMiddleware(cb);
		}

	};




	/**
	 * Bind blueprint/shadow routes for each controller.
	 */
	function bindShadowRoutes () {

		_.each(sails.middleware.controllers, function eachController (controller, controllerId) {
			if (!util.isDictionary(controller)) return;

			// Determine blueprint configuration for this controller
			var config = util.merge({},
				sails.config.blueprints,
				controller._config || {});
			
			// Determine the names of the controller's user-defined actions
			// Use `sails.controllers` instead of `sails.middleware.controllers` (which will have blueprints already mixed-in)
			var actions = Object.keys(sails.controllers[controllerId]);
			
			// Determine base route
			var baseRoute = config.prefix + '/' + controllerId;
			if (config.pluralize) {
				baseRoute = pluralize(baseRoute);
			}

			// Build route options for blueprint
			var routeOpts = config;

			// Bind "actions" and "index" shadows
			_.each(actions, function eachActionID (actionId) {

				// Bind a route based on the action name, if `actions` shadows enabled
				if (config.actions) {
					var actionRoute = baseRoute + '/' + actionId.toLowerCase() + '/:id?';
					sails.log.silly('Binding action ('+actionId.toLowerCase()+') blueprint/shadow route for controller:',controllerId);
					sails.router.bind(actionRoute, controller[actionId], null, routeOpts);
				}

				// Bind base route to index action, if `index` shadows are not disabled
				if (config.index !== false && actionId.match(/^index$/i)) {
					sails.log.silly('Binding index blueprint/shadow route for controller:',controllerId);
					sails.router.bind(baseRoute, controller.index, null, routeOpts);
				}
			});

			// If the orm hook is enabled, it has already been loaded by this time,
			// so just double-check to see if `sails.models` exists before trying to
			// bind CRUD blueprint actions.
			if (sails.hooks.orm && sails.models && sails.models[controllerId]) {

				// If a model exists with the same identity as this controller,
				// extend route options with the id of the model.
				routeOpts.model = controllerId;

				// TODO: determine whether we can remove the following now:
				// 
				// Locate and validate `id` parameter
				// var id = sails.util.(req.param('id'), req.target.controller, 'find');
				// var id = req.param('id');
				// if (id === false) {
				// 	// Id was invalid-- and probably unintentional.
				// 	// Continue on as if this blueprint doesn't exist
				// 	return next();
				// }

				
				// Bind URL-bar "shortcuts"
				// (NOTE: in a future release, these may be superceded by embedding actions in generated controllers
				//  and relying on action blueprints instead.)
				if ( config.shortcuts ) {
					sails.log.silly('Binding shortcut blueprint/shadow routes for controller:',controllerId);
					sails.router.bind(baseRoute + '/find/:id?', _getMiddlewareForShadowRoute(controllerId, 'find'), null, routeOpts);
					sails.router.bind(baseRoute + '/create', _getMiddlewareForShadowRoute(controllerId, 'create'), null, routeOpts);
					sails.router.bind(baseRoute + '/update/:id?', _getMiddlewareForShadowRoute(controllerId, 'update'), null, routeOpts);
					sails.router.bind(baseRoute + '/destroy/:id?', _getMiddlewareForShadowRoute(controllerId, 'destroy'), null, routeOpts);
				}

				// Bind "rest" blueprint/shadow routes
				if ( config.rest ) {
					sails.log.silly('Binding RESTful blueprint/shadow routes for controller:',controllerId);
					sails.router.bind('get ' + baseRoute + '/:id?', _getMiddlewareForShadowRoute(controllerId, 'find'), null, routeOpts);
					sails.router.bind('post ' + baseRoute, _getMiddlewareForShadowRoute(controllerId, 'create'), null, routeOpts);
					sails.router.bind('put ' + baseRoute + '/:id?', _getMiddlewareForShadowRoute(controllerId, 'update'), null, routeOpts);
					sails.router.bind('delete ' + baseRoute + '/:id?', _getMiddlewareForShadowRoute(controllerId, 'destroy'), null, routeOpts);
				}

			}
		});


		/**
		 * Return the middleware for a shadow route to the specified blueprintId.
		 * @param  {String} controllerId
		 * @param  {String} blueprintId  [find, create, etc.]
		 * @return {Function}            [middleware]
		 */
		function _getMiddlewareForShadowRoute (controllerId, blueprintId) {
			//Allow custom actions defined in controller to override blueprint actions.
			return sails.middleware.controllers[controllerId][blueprintId] || hook.middleware[blueprintId];
		}
	}



	/**
	 * (Re)load middleware.
	 *
	 * @api private
	 */
	function loadMiddleware (cb) {
		sails.log.verbose('Loading blueprint middleware...');
		sails.modules.loadBlueprints(function modulesLoaded (err, modules) {
			if (err) return cb(err);

			// Save reference to blueprints middleware in hook.
			hook.middleware = modules;

			// When app controllers are finished loading,
			// merge our blueprint actions into them as defaults.
			sails.once('middleware:registered', function () {
				_.each(sails.middleware.controllers, function (controller) {
					_.defaults(controller, hook.middleware);
				});
			});

			return cb(err);
		});
	}



	/**
	 * Wait until dependency conditions have been satisfied
	 *
	 * TODO: merge w/ sails.after()  [make it accept an array of event names]
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

