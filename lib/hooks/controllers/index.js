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



	/**
	 * Expose `Controller` hook definition
	 */

	return {


		routes: {

			after: {

				// Automatically create routes for every method in the controller
				'get /:controller/:action?': Controller['*'],
				'post /:controller/:action?': Controller['*'],
				'put /:controller/:action?': Controller['*'],
				'delete /:controller/:action?': Controller['*'],

				// Naive CRUD actions
				// (these should be disabled in production!)
				'/:controller/find/:id?': Controller.find,
				'/:controller/create': Controller.create,
				'/:controller/update/:id': Controller.update,
				'/:controller/destroy/:id': Controller.destroy,

				// CRUD actions
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

			var self = this;

			// Grab middleware modules
			this.loadMiddleware(function (err) {
				if (err) return cb(err);

				// Get global blueprint config
				// TODO: bring this in locally at an earlier time so this is less awkward
				var blueprintsEnabled = sails.config.controllers.blueprints.routes;
				var blueprintsPrefix = sails.config.controllers.blueprints.prefix;

				// Auto-routing for controller blueprints
				_.each(self.routes.after, function (ware, route) {
					
					// User disabled the blueprint
					if ( ! blueprintsEnabled[route]) {
						delete self.routes.after[route];
					}

					// User overrode the blueprint ware
					else if ( _.isFunction (blueprintsEnabled[route]) ) {
						self.routes.after[route] = blueprintsEnabled[route];
					}

					// ********************************************************************************
					// TODO: instead of using wildcard routes, establish a route for each controller
					// so that policies can be applied and overriding controller methods will appropriately
					// override CRUD blueprints.
					// ********************************************************************************

				});


				cb();
			});
		},



		/**
		 * Wipe everything and (re)load middleware from controllers, policies, config, and views.
		 *
		 * @api private
		 */

		loadMiddleware: function(cb) {
			var self = this;

			sails.log.verbose('Building middleware registry...');

			async.auto({

				// policies: [
				// 	function(cb) {
				// 		sails.log.verbose('Loading app policies...');

				// 		// Load policy modules
				// 		sails.policies = Modules.optional({
				// 			dirname: sails.config.paths.policies,
				// 			filter: /(.+)\.(js|coffee)$/,
				// 			replaceExpr: null
				// 		});

				// 		// Register policies
				// 		_.extend(self.middleware, sails.policies);

				// 		cb();
				// 	}
				// ],

				// controllers: ['policies',
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

							// Otherwise mix it in
							else if (_.isFunction(action)) {
								self.middleware[controllerId][actionId] = action;
							}

						});

					});

					cb();

				}]

				// bindPolicies: ['policies', 'controllers', self.bindPolicies]

			}, cb);
		}




		/**
		 * Generate resourceful routes based on modules
		 *
		 * @api private
		 */

		// autoRoute: function() {

		// 	var self = this;

		// 	// Start iterating through controllers
		// 	_.each(sails.controllers, function(controller, controllerId) {
				
				
		// 		// Instead of using the actual controller definition,
		// 		// look up the version in the middleware registry, 
		// 		// since it might have policies attached
		// 		var middlewareFn = this.middleware[middlewareId];

		// 		// If the controller is a middleware function, or a chain,
		// 		// create a route for it directly, then bail out
		// 		if (_.isFunction(middlewareFn) || _.isArray(middlewareFn)) {
		// 			bindRoute(this.routes.after, '/' + controllerId, middlewareFn);
		// 			return;
		// 		}


		// 		// Build routes for each action
		// 		_.each(controller, function(target, actionId) {

		// 			// If this isn't a valid target, bail out
		// 			if (!(_.isFunction(target) || _.isArray(target))) {
		// 				sails.log.warn('Action (' + actionId + ') in "' + controllerId + '" could not be dynamically routed because it isn\'t an array or a function.');
		// 				return;
		// 			}

		// 			// Check for verb in actionId
		// 			var detectedVerb = util.detectVerb(actionId);
		// 			actionId = detectedVerb.original;
		// 			var verb = detectedVerb.verb;

		// 			// If a verb is set, the prefix looks like `get /`
		// 			// otherwise, it's just a trailing slash
		// 			var prefix = verb ? verb + ' /' : '/';

		// 			// Bind dynamic routes for actions
		// 			// (if this is `index`, also create a top-level route)
		// 				if (actionId === 'index') {
		// 					bindRoute(this.routes.after, prefix + controllerId, target);
		// 				}
		// 				bindRoute(this.routes.after, prefix + controllerId + '/' + actionId, target);

		// 		}, this);

		// 	}, this);
		// }



		// /**
		//  * Apply the policies config to the middleware in this hook
		//  *
		//  * @api private
		//  */

		// bindPolicies: function(cb) {

		// 	var self = this;

		// 	////////////////////////////////////////////////////////
		// 	// (LEGACY SUPPORT)
		// 	// Prepend policies to chain, as per policy configuration
		// 	_.each(self.middleware, function(middleware, id) {

		// 		var policy = sails.config.policies[id];

		// 		// If a policy doesn't exist for this controller, use '*'
		// 		if (_.isUndefined(policy)) {
		// 			policy = sails.config.policies['*'];
		// 		}

		// 		// Normalize policy to an array
		// 		policy = normalizePolicy(policy);

		// 		// If this is a top-level policy, apply it immediately
		// 		if (_.isArray(policy)) {

		// 			// If this controller is a container object, apply the policy to all the actions
		// 			if (_.isObject(self.middleware[id])) {
		// 				_.each(self.middleware[id], function(action, actionId) {
		// 					self.middleware[id][actionId] = policy.concat([self.middleware[id][actionId]]);
		// 				});
		// 			}

		// 			// Otherwise apply the policy directly to the controller
		// 			else if (_.isFunction(self.middleware[id])) {
		// 				self.middleware[id] = policy.concat([self.middleware[id]]);
		// 			}
		// 		}

		// 		// If this is NOT a top-level policy, and merely a container of other policies,
		// 		// iterate through each of this controller's actions and apply policies in a way that makes sense
		// 		else {
		// 			_.each(self.middleware[id], function(action, actionId) {

		// 				var actionPolicy = sails.config.policies[id][actionId];

		// 				// If a policy doesn't exist for this controller, use the controller-local '*'
		// 				if (_.isUndefined(actionPolicy)) {
		// 					actionPolicy = sails.config.policies[id]['*'];
		// 				}

		// 				// if THAT doesn't exist, use the global '*' policy
		// 				if (_.isUndefined(actionPolicy)) {
		// 					actionPolicy = sails.config.policies['*'];
		// 				}

		// 				// Normalize action policy to an array
		// 				actionPolicy = normalizePolicy(actionPolicy);

		// 				self.middleware[id][actionId] = actionPolicy.concat([self.middleware[id][actionId]]);
		// 			});
		// 		}

		// 	});
		// 	////////////////////////////////////////////////////////

		// 	cb();
		// },

	};


	// /**
	//  * Convert policy into array notation
	//  *
	//  * @param {Object} options
	//  * @api private
	//  */

	// function normalizePolicy(policy) {

	// 	// Recursively normalize lists of policies
	// 	if (_.isArray(policy)) {
	// 		for (var i in policy) {
	// 			normalizePolicy(policy[i]);
	// 		}
	// 		return policy;
	// 	} else if (_.isString(policy) || _.isFunction(policy)) {
	// 		return [policy];
	// 	} else if (!policy) {
	// 		return [function(req, res, next) {
	// 			res.send(403);
	// 		}];
	// 	} else if (policy === true) {
	// 		return [function(req, res, next) {
	// 			next();
	// 		}];
	// 	}

	// 	sails.log.error('Cannot map invalid policy: ', policy);
	// 	return [function(req, res) {
	// 		throw new Error('Invalid policy: ' + policy);
	// 	}];
	// }


	// /**
	//  * Bind a target middleware or chain to a route
	//  * If the route already exists as a list, append it
	//  *
	//  * @api private
	//  */
	// function bindRoute(router, route, target) {
	// 	if (_.isArray(router[route])) {
	// 		router[route].push(target);
	// 	}
	// 	else router[route] = target;
	// }

};