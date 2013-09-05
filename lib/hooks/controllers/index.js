module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
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


			// Apply prefix config (but strip leading and trailing slash)
			var blueprintsPrefix = sails.config.controllers.blueprints.prefix;

			var route = '/:controller/:action?';

			// If the action routes are enabled, we must bind routes
			if ( sails.config.controllers.blueprints.actions ) {

				// For every controller, bind all of its actions as routes
				_.each(sails.controllers, function (controller, controllerId) {
					// TODO: support blueprint config on a per-controller basis
					if (!util.isDictionary(controller)) {
						return;
					}

					var controllerActions = _.functions(sails.controllers[controllerId]);
					_.each(controllerActions, function (actionId) {


						// Split actionId on spaces to enable auto-routing of verb-actions:
						// e.g. `verb action` creates routes like `:verb /:controller/:actionId`
						// TODO:

						// Ensure case-insensitivity by lowercasing both the action name
						// and the route
						actionId = actionId.toLowerCase();

						// Bind index route
						if (actionId === 'index') {
							var indexRoute = blueprintsPrefix + '/' + controllerId;
							sails.router.bind(indexRoute, _serveBlueprint(controllerId, actionId));
						}

						// Apply controller and action to route expresion
						// (All HTTP verbs)

						// TODO:	check that :id? is !== create, update, or destroy 
						//			in route regexp to preserve proper shortcut behavior
						var appliedRoute = blueprintsPrefix + '/' + controllerId + '/' + actionId + '/:id?';
						sails.router.bind(appliedRoute, _serveBlueprint(controllerId, actionId));

					});
				});
			}

			sails.emit('hook:controllers:bound:actions');
		},


		/**
		 * Bind blueprint routes
		 * (serves CRUD middleware for controllers with matching models)
		 * Then fire the final :bound event
		 */
		
		bindCRUDRoutes: function ( ) {
			var self = this;

			// Apply prefix config (but strip leading and trailing slash)
			var blueprintsPrefix = sails.config.controllers.blueprints.prefix;

			// For every controller, bind all of its actions as routes
			_.each(sails.controllers, function (controller, controllerId) {

				// TODO: support blueprint config on a per-controller basis
				if (!util.isDictionary(controller)) {
					return;
				}

				// RESTful CRUD blueprints
				if ( sails.config.controllers.blueprints.rest ) {
					sails.log.verbose('Binding RESTful controller blueprints for ',controllerId);
					sails.router.bind('get ' + blueprintsPrefix + '/'+ controllerId + '/:id?', _serveBlueprint(controllerId, 'find'));
					sails.router.bind('post ' + blueprintsPrefix + '/'+ controllerId, _serveBlueprint(controllerId, 'create'));
					sails.router.bind('put ' + blueprintsPrefix + '/'+ controllerId + '/:id?', _serveBlueprint(controllerId, 'update'));
					sails.router.bind('delete ' + blueprintsPrefix + '/'+ controllerId + '/:id?', _serveBlueprint(controllerId, 'destroy'));
				}

				// Shortcut CRUD blueprints
				if ( sails.config.controllers.blueprints.shortcuts ) {
					sails.log.verbose('Binding shortcut controller blueprints for ',controllerId);
					sails.router.bind(blueprintsPrefix + '/'+ controllerId + '/find/:id?', _serveBlueprint(controllerId, 'find'));
					sails.router.bind(blueprintsPrefix + '/'+ controllerId + '/create', _serveBlueprint(controllerId, 'create'));
					sails.router.bind(blueprintsPrefix + '/'+ controllerId + '/update/:id?', _serveBlueprint(controllerId, 'update'));
					sails.router.bind(blueprintsPrefix + '/'+ controllerId + '/destroy/:id?', _serveBlueprint(controllerId, 'destroy'));
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

			async.auto({

				controllers: [function(cb) {

					sails.log.verbose('Loading app controllers...');

					// Load app controllers
					sails.controllers = Modules.optional({
						dirname: sails.config.paths.controllers,
						filter: /(.+)Controller\.(js|coffee)$/,
						replaceExpr: /Controller/
					});

					// Get federated controllers where actions are specified each in their own file
					var federatedControllers = Modules.optional({
						dirname: sails.config.paths.controllers,
						pathFilter: /(.+)\/(.+)\.(js|coffee)$/
					});
					sails.controllers = _.extend(sails.controllers, federatedControllers);


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


					// Done
					cb();

				}]

			}, cb);
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