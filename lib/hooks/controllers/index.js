module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
		util = require('../../util'),
		Modules = require('../../moduleloader'),
		Controller = {
			'*': require('./controller.action.js')(sails),
			find: require('./controller.find.js')(sails),
			create: require('./controller.create.js')(sails),
			update: require('./controller.update.js')(sails),
			destroy: require('./controller.destroy.js')(sails)
		};

	// TODO: bind policies to blueprints if policy hook is enabled
	// (this should really happen in the policies hook, 
	// but we'll want to expose the blueprints as members of the hook instance just to be safe)


	/**
	 * Expose `Controller` hook definition
	 */

	return {


		blueprints: {

			// Automatically create routes for every action in the controller
			actions: {
				'get /:controller/:action?': Controller['*'],
				'post /:controller/:action?': Controller['*'],
				'put /:controller/:action?': Controller['*'],
				'delete /:controller/:action?': Controller['*']
			},

			crud: {

				// Naive CRUD actions
				// (these should be disabled in production!)
				'/:controller/find/:id?': Controller.find,
				'/:controller/create': Controller.create,
				'/:controller/update/:id': Controller.update,
				'/:controller/destroy/:id': Controller.destroy,

				// RESTful CRUD actions
				'get /:controller/:id?': Controller.find,
				'post /:controller': Controller.create,
				'put /:controller/:id': Controller.update,
				'delete /:controller/:id': Controller.destroy
			}

		},


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

			
			// If views hook is enabled, wait to register CRUD routes 
			// until after the view routes are registered
			if (sails.config.hooks.views) {
				bindCRUDRoutes_dependencies.push('hook:views:bound');
			}

			// If policies hook is enabled, wait until policies are bound 
			// before binding action AND crud blueprint routes
			if (sails.config.hooks.policies) {
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
			_.each(this.blueprints.actions, this.bindRoute);
			sails.emit('hook:controllers:bound:actions');
		},


		/**
		 * Bind blueprint routes
		 * (serves CRUD middleware for controllers with matching models)
		 * Then fire the final :bound event
		 */
		
		bindCRUDRoutes: function ( ) {
			_.each(this.blueprints.crud, this.bindRoute);
			sails.emit('hook:controllers:bound:crud');
			sails.emit('hook:controllers:bound');
		},



		/**
		 * Bind a route
		 * @param {Function} ware
		 * @param {String} route
		 */

		bindRoute: function (ware, route) {

			// Get global blueprint config
			var blueprintsEnabled = sails.config.controllers.blueprints.routes;
			var blueprintsPrefix = sails.config.controllers.blueprints.prefix;

						
			// TODO: support blueprint config on a per-controller basis


			// Apply prefix config (but strip leading and trailing slash)
			// Pull route apart into pieces so that the prefix can be injected
			var actualRoute = route;
			blueprintsPrefix = blueprintsPrefix.replace(/^\/|\/$/g, '');
			var verb = util.detectVerb(actualRoute).verb;
			actualRoute = actionId = util.detectVerb(actualRoute).path;

			// If a verb is set, the prefix looks like `get /`
			// otherwise, it's just a trailing slash
			actualRoute = (verb ? verb + ' ' : '') + blueprintsPrefix + actualRoute;
			
			
			// If the blueprint is enabled, we must prepare to bind a route
			if ( blueprintsEnabled[route] ) {
				
				// If the user overrode the blueprint ware,
				// set the custom method up to be bound
				if ( _.isFunction (blueprintsEnabled[route]) ) {
					ware = blueprintsEnabled[route];
				}

				// Otherwise the default will be used

				// Bind the blueprint
				sails.router.bind(actualRoute, function wrapperFn (req,res,next) {
					
					// Track the controller/action target
					// (grab from the path params)
					req.target = {
						controller: req.params.controller,
						action: req.params.action
					};

					ware(req,res,next);
				});
			}
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
						if (!_.isObject(self.middleware[controllerId])) {
							self.middleware[controllerId] = {};
						}

						// Mix in middleware from blueprints
						self.middleware[controllerId].find = Controller.find;
						self.middleware[controllerId].create = Controller.create;
						self.middleware[controllerId].update = Controller.update;
						self.middleware[controllerId].destroy = Controller.destroy;

						// Mix in middleware from user controller
						_.each(controller, function(action, actionId) {

							// If the action is set to `false`, explicitly disable it
							if (action === false) {
								delete self.middleware[controllerId][actionId];
							}

							// Otherwise mix it in (this will override CRUD blueprints from above)
							else if (_.isFunction(action)) {
								self.middleware[controllerId][actionId] = action;
							}

						});
					});


					// Done
					cb();

				}]

			}, cb);
		}
	};



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