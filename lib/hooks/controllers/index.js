module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var async = require('async'),
		pluralize = require('pluralize'),
		util = require('../../util'),
		Modules = require('../../moduleloader');


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


			// bind blueprint routes
			var blueprintDependencies = ['router:after'],
				self = this;

			// If policies hook is enabled, wait until policies are bound 
			// before binding blueprint routes
			if (sails.hooks.policies) {
				blueprintDependencies.push('hook:policies:bound');
			}

			// Bind routes at the appropriate times
			waitForAll(blueprintDependencies, function () {
				util.each(sails.controllers, function (controller) {
					self.bindBlueprints(controller);
				});
				self.ready = true;
			});

			// Grab middleware modules and trigger callback
			self.loadMiddleware(cb);

			// Register with router
			sails.on('route:typeUnknown', function (route) {
				self._bindRoute(route);
			});
		},

		_bindRoute: function (route) {
			if (!route.target || !(util.isString(route.target) || route.target.controller)) {
				return;
			}

			var controllerId = null, actionId = null;
			if (util.isString(route.target)) {
				var parsed = route.target.match(/^([^.]+)\.?([^.]*)?$/);
				if (!parsed) {
					return;
				}
				controllerId = parsed[1];
				actionId = parsed[2];
			} else if (route.target.controller) {
				controllerId = route.target.controller;
				actionId = route.target.action;
			} else {
				return;
			}

			controllerId = util.normalizeControllerId(route.target.controller);

			if (util.isEmpty(controllerId)) {
				return;
			}

			var controller = sails.middleware.controllers[controllerId];
			if (!controller) {
				return;
			}

			if (route.verb || actionId) {
				actionId = (actionId || 'index').toLowerCase();
				if (!sails.middleware.controllers[controllerId][actionId]) {
					return;
				}
				return sails.router.bind(route.path, _serveBlueprint(controllerId, actionId), route.verb);
			}

			controller = sails.controllers[controllerId];
			if (!controller) {
				return;
			}
			self.bindBlueprints(controller, route.path);
		},

		bindBlueprints: function (controller, prefix) {
			var blueprints = blueprintsForController(controller);
			if (util.isEmpty(blueprints)) {
				return;
			}

			var self = this;
			util.each(blueprints, function (blueprint) {
				self.bindBlueprint(blueprint, controller, prefix);
			});
		},

		bindBlueprint: function (blueprintId, controller, prefix) {
			if (!util.isDictionary(controller)) {
				return;
			}

			var blueprint = sails.blueprints[blueprintId];
			// Attempt to load missing blueprint by name from npm
			if (!blueprint) {
				try {
					blueprint = require(blueprintId);
				} catch (err) {
					return;
				}
				if (util.isFunction(blueprint)) {
					blueprint = blueprint(sails);
				}
				blueprint.identity = blueprintId;
				blueprint.globalId = blueprintId;
				sails.blueprints[blueprintId] = blueprint;
			}

			prefix = prefix || controllerPrefix(controller);

			sails.log.verbose('Binding ' + blueprintId + ' blueprint routes for ' + controller.identity + ' at ' + prefix);
			var blueprintRoutes = blueprint.routes;
			if (util.isFunction(blueprintRoutes)) {
				blueprintRoutes = blueprintRoutes(controller);
			}
			util.each(blueprintRoutes, function (actionId, route) {
				var detectedVerb = util.detectVerb(route),
					verb = '';
				if (detectedVerb.verb) {
					verb = detectedVerb.verb + ' ';
					route = detectedVerb.path;
				}
				if (route === '/') {
					route = '';
				}
				route = verb + prefix + route;
				sails.router.bind(route, _serveBlueprint(controller.identity, actionId));
			});
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
				// sails.controllers = util.extend(sails.controllers, federatedControllers);

				// Register controllers
				util.each(sails.controllers, function(controller, controllerId) {

					// Override whatever was here before
					if ( !util.isDictionary(self.middleware[controllerId]) ) {
						self.middleware[controllerId] = {};
					}

					// Mix in blueprints
					util.each(blueprintsForController(controller), function (blueprint) {
						var blueprintMiddleware = sails.blueprints[blueprint].middleware;
						if (util.isFunction(blueprintMiddleware)) {
							blueprintMiddleware = blueprintMiddleware(controller);
						}
						util.extend(self.middleware[controllerId], blueprintMiddleware);
					});

					// Mix in middleware from user controller
					util.each(controller, function(action, actionId) {

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

						// Otherwise mix it in (this will override blueprints from above)
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
		util.each(events, function (event) {
			dependencies.push(function waitFor (cb) {
				return sails.on(event, cb);
			});					
		});
		
		async.auto(dependencies, function (err) {
			sails.log.verbose('Lifting guard-- all conditions satisfied.');
			return cb(err);
		});
	}

	function blueprintsForController (controller) {
		// Find which blueprints to use
		var blueprints = [];
		if (!controller) {
			return [];
		} else if (controller.blueprint) {
			// Legacy blueprint config support
			util.each(sails.config.blueprints, function (blueprint) {
				if (controller.blueprint[blueprint] !== false) {
					blueprints.push(blueprint);
				}
			});
		} else {
			blueprints = controller.blueprints || sails.config.blueprints;
		}
		return blueprints;
	}

	function controllerPrefix (controller) {
		// Merging controller blueprint config with app-level blueprint config
		var blueprintConfig = util.extend({}, sails.config.controllers.blueprints, controller.blueprint);
		return blueprintConfig.prefix + '/' + (blueprintConfig.pluralize ? pluralize(controller.identity) : controller.identity);
	}

};