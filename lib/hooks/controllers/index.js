module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
		pluralize = require('pluralize'),
		util = require('../../util'),
		Modules = require('../../moduleloader'),
		Controller = {
			find: require('./controller.find.js')(sails),
			create: require('./controller.create.js')(sails),
			update: require('./controller.update.js')(sails),
			destroy: require('./controller.destroy.js')(sails)
		};

		

	/**
	 * Expose `Controller` hook definition
	 */

	return {

		// Don't allow sails to lift until ready 
		// is explicitly set below
		ready: false,


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {

			// Optional callback
			cb = util.optional(cb);


			// bind action routes
			// (auto-routing for controller blueprints)
			var bindActionRoutes_dependencies = [
				'router:after'
			];

			// bind crud routes
			var bindCRUDRoutes_dependencies = [
				'router:after',
				'hook:controllers:bound:actions'
			];


			// If policies hook is enabled, wait until policies are bound 
			// before binding action AND crud blueprint routes
			if (sails.hooks.policies) {
				bindActionRoutes_dependencies.push('hook:policies:bound');
				bindCRUDRoutes_dependencies.push('hook:policies:bound');
			}


			// Bind routes at the appropriate times
			waitForAll(bindActionRoutes_dependencies, this.bindActionRoutes);
			waitForAll(bindCRUDRoutes_dependencies, this.bindCRUDRoutes);

			// Grab middleware modules and trigger callback
			this.loadMiddleware(cb);

		},


		/**
		 * Bind blueprint routes handle controller actions
		 */

		bindActionRoutes: function () {			

			// For every controller, bind all of its actions as routes
			_.each(sails.controllers, function (controller, controllerId) {
				if (!util.isDictionary(controller)) {
					return;
				}

				// Merging controller blueprint config with app-level blueprint config
				var blueprintConfig = _.extend({}, sails.config.controllers.blueprints, controller.blueprint);

				// If the action routes are enabled, we must bind routes
				if (blueprintConfig.actions) {

					var controllerActions = _.functions(sails.controllers[controllerId]);

					// Determine route to bind to
					// Apply prefix config (but strip leading and trailing slash)
					// TODO: apply `route` config
					var controllerRoute = blueprintConfig.pluralize ? pluralize(controllerId) : controllerId;
					_.each(controllerActions, function (actionId) {

						// Ensure case-insensitivity by lowercasing both the action name
						// and the route
						actionId = actionId.toLowerCase();

						// Bind index route
						if (actionId === 'index') {
							var indexRoute = blueprintConfig.prefix + '/' + controllerRoute;
							sails.router.bind(indexRoute, _serveBlueprint(controllerId, actionId));
						}

						// Apply controller and action to route expresion
						// (All HTTP verbs)

						// TODO:	check that :id? is !== create, update, or destroy 
						//			in route regexp to preserve proper shortcut behavior
						var appliedRoute = blueprintConfig.prefix + '/' + controllerRoute + '/' + actionId + '/:id?';
						sails.router.bind(appliedRoute, _serveBlueprint(controllerId, actionId));

					});

				}

			});

			sails.emit('hook:controllers:bound:actions');
		},


		/**
		 * Bind blueprint routes
		 * (serves CRUD middleware for controllers with matching models)
		 * Then fire the final :bound event
		 */
		
		bindCRUDRoutes: function ( ) {
			var self = this;

			// For every controller, bind all of its actions as routes
			_.each(sails.controllers, function (controller, controllerId) {

				// TODO: support blueprint config on a per-controller basis
				if (!util.isDictionary(controller)) {
					return;
				}

				// Merging controller blueprint config with app-level blueprint config
				var blueprintConfig = _.extend({}, sails.config.controllers.blueprints, controller.blueprint);

				// Determine route to bind to
				// Apply prefix config (but strip leading and trailing slash)
				// TODO: apply `route` config
				var controllerRoute = blueprintConfig.pluralize ? pluralize(controllerId) : controllerId;

				// RESTful CRUD blueprints
				if ( blueprintConfig.rest ) {
					sails.log.verbose('Binding RESTful controller blueprints for ',controllerId);
					sails.router.bind('get ' + blueprintConfig.prefix + '/'+ controllerRoute + '/:id?', _serveBlueprint(controllerId, 'find'));
					sails.router.bind('post ' + blueprintConfig.prefix + '/'+ controllerRoute, _serveBlueprint(controllerId, 'create'));
					sails.router.bind('put ' + blueprintConfig.prefix + '/'+ controllerRoute + '/:id?', _serveBlueprint(controllerId, 'update'));
					sails.router.bind('delete ' + blueprintConfig.prefix + '/'+ controllerRoute + '/:id?', _serveBlueprint(controllerId, 'destroy'));
				}

				// Shortcut CRUD blueprints
				if ( blueprintConfig.shortcuts ) {
					sails.log.verbose('Binding shortcut controller blueprints for ',controllerId);
					sails.router.bind(blueprintConfig.prefix + '/'+ controllerRoute + '/find/:id?', _serveBlueprint(controllerId, 'find'));
					sails.router.bind(blueprintConfig.prefix + '/'+ controllerRoute + '/create', _serveBlueprint(controllerId, 'create'));
					sails.router.bind(blueprintConfig.prefix + '/'+ controllerRoute + '/update/:id?', _serveBlueprint(controllerId, 'update'));
					sails.router.bind(blueprintConfig.prefix + '/'+ controllerRoute + '/destroy/:id?', _serveBlueprint(controllerId, 'destroy'));
				}
			});

			sails.emit('hook:controllers:bound:crud');
			this.ready = true;
		},



		/**
		 * Wipe everything and (re)load middleware from controllers
		 *
		 * @api private
		 */

		loadMiddleware: function(cb) {
			var self = this;

			sails.log.verbose('Building middleware registry...');

			// Load app controllers
			sails.log.verbose('Loading controller modules from app...');
			Modules.optional({
				dirname: sails.config.paths.controllers,
				filter: /(.+)Controller\.(js|coffee)$/,
				replaceExpr: /Controller/
			}, function modulesLoaded (err, modules) {
				if (err) return cb(err);

				// Save freshly loaded modules in `sails.controllers`
				sails.controllers = modules;

				// Get federated controllers where actions are specified each in their own file
				// var federatedControllers = Modules.optional({
				// 	dirname: sails.config.paths.controllers,
				// 	pathFilter: /(.+)\/(.+)\.(js|coffee)$/
				// });
				// sails.controllers = _.extend(sails.controllers, federatedControllers);

				// Register controllers
				_.each(sails.controllers, function(controller, controllerId) {

					// Override whatever was here before
					if ( !util.isDictionary(self.middleware[controllerId]) ) {
						self.middleware[controllerId] = {};
					}

					// Mix in middleware from blueprints
					self.middleware[controllerId].find = Controller.find;
					self.middleware[controllerId].create = Controller.create;
					self.middleware[controllerId].update = Controller.update;
					self.middleware[controllerId].destroy = Controller.destroy;

					// Mix in middleware from user controller
					_.each(controller, function(action, actionId) {

						// action ids are case insensitive
						actionId = actionId.toLowerCase();


						// If the action is set to `false`, explicitly disable it
						if (action === false) {
							delete self.middleware[controllerId][actionId];
							return;
						}

						// Ignore special properties
						// TODO: hide these in the prototype (moduleloader)
						if (util.isString(action) || util.isBoolean(action)) {
							return;
						}

						// Otherwise mix it in (this will override CRUD blueprints from above)
						self.middleware[controllerId][actionId] = action;
					});
				});

				// Done!
				return cb();
			});
		}
	};


	/**
	 * Returns a middleware chain that remembers the target and rns a blueprint
	 * (This concatenation approach is crucial to allow policies to be bound)
	 */

	function _serveBlueprint (controllerId, actionId) {
		return [function wrapperFn (req, res, next) {

			// Track the controller/action target
			// (grab from the path params)
			req.target = {
				controller: controllerId,
				action: actionId
			};

			next();

		}].concat(sails.middleware.controllers[controllerId][actionId]);
	}



	/**
	 * Wait until dependency conditions have been satisfied
	 *
	 * @param {Object} events - list of sails.on() event names to wait for
	 * @param {Function} cb
	 *
	 * @api private
	 */

	function waitForAll (events, cb) {
		sails.log.verbose('Waiting to lift guard until all these events have fired ::', events);

		var dependencies = [];
		_.each(events, function (event) {
			dependencies.push(function waitFor (cb) {
				return sails.on(event, cb);
			});					
		});
		
		async.auto(dependencies, function (err) {
			sails.log.verbose('Lifting guard-- all conditions satisfied.');
			return cb(err);
		});
	}

};