/**
 * Module dependencies
 */

var _ = require('lodash')
	, util = require('util')
	, async = require('async')
	, pluralize = require('pluralize')
	, BlueprintController = {
			find		: require('./actions/find')
		,	populate: require('./actions/populate')
		,	create	: require('./actions/create')
		, update	: require('./actions/update')
		, destroy	: require('./actions/destroy')
	};



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




				// Configuration of the actions themselves:
				// 
				// (disabled short-term, may be added back as-needed)
				//
				// Skip blueprint if `:id?` is NOT an integer.
				// expectIntegerId: false, 
				// // Enable JSONP callbacks.
				// jsonp: false
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
			sails.after(eventsToWaitFor, bindShadowRoutes);

			// Load blueprint middleware and continue.
			loadMiddleware(cb);
		}

	};




	/**
	 * Bind blueprint/shadow routes for each controller.
	 */
	function bindShadowRoutes () {

		_.each(sails.middleware.controllers, function eachController (controller, controllerId) {
			if ( !_.isObject(controller) || _.isArray(controller) ) return;

			// Determine blueprint configuration for this controller
			var config = _.merge({},
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

				var Model = sails.models[controllerId];

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

				// Bind convenience functions for readability below:
				var _getAction = _.partial(_getMiddlewareForShadowRoute, controllerId);
				var _getRoute = _.partialRight(util.format,baseRoute);

				// Mix in the known associations for this model to the route options.
				routeOpts = _.defaults({ associations: _.cloneDeep(Model.associations) }, routeOpts);

				// Bind URL-bar "shortcuts"
				// (NOTE: in a future release, these may be superceded by embedding actions in generated controllers
				//  and relying on action blueprints instead.)
				if ( config.shortcuts ) {
					sails.log.silly('Binding shortcut blueprint/shadow routes for model+controller:',controllerId);
					
					sails.router.bind( _getRoute('%s/find/:id?'),      _getAction('find'),    null, routeOpts );
					sails.router.bind( _getRoute('%s/create'),         _getAction('create'),  null, routeOpts );
					sails.router.bind( _getRoute('%s/update/:id?'),    _getAction('update'),  null, routeOpts );
					sails.router.bind( _getRoute('%s/destroy/:id?'),   _getAction('destroy'), null, routeOpts );
				}

				// Bind "rest" blueprint/shadow routes
				if ( config.rest ) {
					sails.log.silly('Binding RESTful blueprint/shadow routes for model+controller:',controllerId);

					sails.router.bind( _getRoute('get %s/:id?'),    _getAction('find'),    null, routeOpts );
					sails.router.bind( _getRoute('post %s'),        _getAction('create'),  null, routeOpts );
					sails.router.bind( _getRoute('put %s/:id?'),    _getAction('update'),  null, routeOpts );
					sails.router.bind( _getRoute('delete %s/:id?'), _getAction('destroy'), null, routeOpts );

					// Bind resourceful routes based on known associations in our model's schema, i.e.:
					// {
					// 	 friends: { collection: 'user' }
					// }
					Model.associations.forEach(function (association) {

						var alias = association.alias;
						var _getAssocRoute = _.partialRight(util.format, baseRoute, alias);
						routeOpts = _.defaults({ alias: alias }, routeOpts);

						// Bind the blueprint route
						sails.log.silly('Binding blueprint route for association `'+alias+'` for',controllerId);
						sails.router.bind( _getAssocRoute('get %s/:parentid/%s/:id?'), _getAction('populate'), null, routeOpts );
 
						// TODO: add (link) [creates new model instance if other params are specified instead of an `id`]
						// sails.router.bind( _getAssocRoute('???'), _getAction('link'), null, routeOpts );
						// 
						// TODO: remove (unlink)
						// sails.router.bind( _getAssocRoute('???'), _getAction('unlink'), null, routeOpts );
						
						return;
					});
				}

			}
		});


		/**
		 * Return the middleware for a shadow route to the specified blueprintId.
		 * Will use the action if it exists, otherwise will use the blueprint.
		 * 
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
	 * First, built-in blueprint actions in core Sails will be loaded.
	 * Then, we'll attempt to load any custom blueprint definitions from
	 * the user app using moduleloader.
	 * 
	 * @api private
	 */

	function loadMiddleware (cb) {
		sails.log.verbose('Loading blueprint middleware...');

		// Start off w/ the built-in blueprint actions (generic CRUD logic)
		BlueprintController;

		// Get custom blueprint definitions
		sails.modules.loadBlueprints(function modulesLoaded (err, modules) {
			if (err) return cb(err);

			// Merge custom overrides from our app into the BlueprintController
			// in Sails core.
			_.extend(BlueprintController, modules);

			// Save reference to blueprints middleware in hook.
			hook.middleware = BlueprintController;

			// When our app's controllers are finished loading,
			// merge the blueprint actions into each of them as defaults.
			sails.once('middleware:registered', function () {
				_.each(sails.middleware.controllers, function (controller) {
					_.defaults(controller, hook.middleware);
				});
			});

			return cb(err);
		});
	}

};

