module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
		util = require('../../util'),
		Modules = require('../../moduleloader');


	/**
	 * Expose `policies` hook definition
	 */

	return {


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {

			// Callback is optional
			cb = util.optional(cb);

			var self = this;

			// Grab policies config & policy modules and trigger callback
			this.loadMiddleware( function (err) {
				if (err) return cb(err);

				// Build / normalize policy config
				self.mapping = self.buildPolicyMap();

				sails.log.verbose('Finished loading policy middleware logic.');
				cb();
			});

			// Before routing, curry controller functions with appropriate policy chains
			sails.on('router:before', this.bindPolicies);
		},



		/**
		 * Wipe everything and (re)load middleware from policies
		 * (policies.js config is already loaded at this point)
		 *
		 * @api private
		 */

		loadMiddleware: function(cb) {
			var self = this;

			sails.log.verbose('Loading app policies...');

			// Load policy modules
			var modules = Modules.optional({
				dirname: sails.config.paths.policies,
				filter: /(.+)\.(js|coffee)$/,
				replaceExpr: null
			});

			// Register policies
			_.extend(self.middleware, modules);

			cb();
		},



		/**
		 * Curry the policy chains into the appropriate controller functions
		 *
		 * @api private
		 */

		bindPolicies: function() {

			sails.log.verbose('Binding policies to controllers...', this.mapping);
			console.log('\n\n\nBinding policies to controllers...', this.mapping);
			
			// Iterate through each controller
			_.each(sails.middleware.controllers, function(_c, id) {

				var policy = this.mapping[id];
				var actions, actionFn;
				var controller = sails.middleware.controllers[id];


				// If a policy doesn't exist for this controller, use '*'
				if ( _.isUndefined(policy) ) {
					policy = this.mapping['*'];
				}

				sails.log.verbose('Applying policy :: ', policy, ' to ', id);

				// Build list of actions
				if ( util.isDictionary(controller) ) {
					actions = _.functions(controller);
				}

				// If this is a controller policy, apply it immediately
				if (_.isArray(policy)) {


					// :: Controller is a container object
					// -> apply the policy to all the actions
					if ( util.isDictionary(controller) ) {
						sails.log.verbose('Applying policy (' + policy + ') to controller\'s (' + id + ') actions...');
						_.each(actions, function(actionId) {
							actionFn = controller[actionId];
							sails.log.verbose('Applying policy to ' + actionId + '...');
							controller[actionId] = policy.concat([actionFn]);
						}, this);
					}

					// :: Controller is a function
					// -> apply the policy directly
					else if ( _.isFunction(controller) ) {
						sails.log.verbose('Applying policy (' + policy + ') to top-level controller middleware fn (' + id + ')...');
						controller = policy.concat([controller]);
					}
				}

				// If this is NOT a top-level policy, and merely a container of other policies,
				// iterate through each of this controller's actions and apply policies in a way that makes sense
				else {
					_.each(actions, function(actionId) {

						var actionPolicy = this.mapping[id][actionId];
						sails.log.verbose('Mapping policies to actions.... ', actions);

						// If a policy doesn't exist for this controller, use the controller-local '*'
						if ( _.isUndefined(actionPolicy) ) {
							actionPolicy = this.mapping[id]['*'];
						}

						// if THAT doesn't exist, use the global '*' policy
						if ( _.isUndefined(actionPolicy) ) {
							actionPolicy = this.mapping['*'];
						}
						sails.log.verbose('Applying policy (' + actionPolicy + ') to action (' + id + '.' + actionId + ')...');

						actionFn = controller[actionId];
						controller[actionId] = actionPolicy.concat([actionFn]);
					}, this);
				}

			}, this);

			// Emit event to let other hooks know we're ready to go
			sails.log.verbose('Policy-controller bindings complete!');
			sails.emit('hook:policies:bound');
			
			// sails.log.verbose('CONTROLLERS:',sails.middleware.controllers);
			// sails.log.verbose('POLICIES:',this.mapping);
		},



		/**
		 * Build normalized, hook-internal representation of policy mapping 
		 * by performing a non-destructive parse of `sails.config.policies`
		 *
		 * @returns {Object} mapping
		 * @api private
		 */

		buildPolicyMap: function () {

			var mapping = {};
			_.each(sails.config.policies, function (_policy, controllerId) {

				// Case-insensitivity
				controllerId = controllerId.toLowerCase();

				console.log('mapping controllerid:',controllerId, ' to ', _policy, sails.config.policies);
				
				// Controller-level policy ::
				// Just map the policy to the controller directly
				if ( ! util.isDictionary(_policy) ) {
					console.log('direct policy: ', controllerId);
					mapping[controllerId] = this.normalizePolicy(_policy);
					return;
				}
				
				// Policy mapping contains a sub-object :: 
				// So we need to dive in and build/normalize the policy mapping from here
				// Mapping each policy to each action for this controller
				mapping[controllerId] = {};
				_.each( _policy, function (__policy, actionId) {
					mapping[controllerId][actionId] = this.normalizePolicy(__policy);
				}, this);
				
			}, this);

			return mapping;
		},


		/**
		 * Convert a single policy into shallow array notation
		 * (look up string policies using middleware in this hook)
		 *
		 * @param {Array|String|Function|Boolean} policy
		 * @api private
		 */

		normalizePolicy: function (policy) {

			// Recursively normalize lists of policies
			if ( _.isArray(policy) ) {

				var policyChain = _.clone(policy);

				// Normalize each policy in the chain
				_.map(policyChain, function normalize_each_policy (policy) {
					return normalizePolicy(policy);
				});

				// Then flatten the policy chain
				return _.flatten(policyChain);
			}

			// Look up the policy in the policy registry
			if ( _.isString(policy) ) {

				// Case-insensitive
				policy = policy.toLowerCase();

				var lookedUpPolicy = _.clone(this.middleware[policy]);
				return [lookedUpPolicy];
			}
			
			// An explicitly defined, anonymous policy middleware can be directly attached
			if ( _.isFunction(policy) ) {

				var anonymousPolicy = _.clone(policy);
				return [anonymousPolicy];
			}

			// A false or null policy means NEVER allow any requests
			if (policy === false || policy === null) {
				return [function neverAllow (req, res, next) {
					res.send(403);
				}];
			}

			// A true policy means ALWAYS allow requests
			if (policy === true) {
				return [function alwaysAllow (req, res, next) {
					next();
				}];
			}

			// If we made it here, the policy is invalid
			sails.log.error('Cannot map invalid policy: ', policy);
			return [function(req, res) {
				throw new Error('Invalid policy: ' + policy);
			}];
		}

	};

};
