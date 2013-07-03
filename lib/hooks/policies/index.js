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

			// Build / normalize policy config
			this.mapping = this.buildPolicyMap();

			// Grab policies config & policy modules and trigger callback
			this.loadMiddleware(cb);

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
		 * Apply the policies config to the middleware in this hook
		 *
		 * @api private
		 */

		bindPolicies: function(cb) {

			// var self = this;

			// ////////////////////////////////////////////////////////
			// // (LEGACY SUPPORT)
			// // Prepend policies to chain, as per policy configuration
			// _.each(self.middleware, function(middleware, id) {

			// 	var policy = sails.config.policies[id];

			// 	// If a policy doesn't exist for this controller, use '*'
			// 	if (_.isUndefined(policy)) {
			// 		policy = sails.config.policies['*'];
			// 	}

			// 	// Normalize policy to an array
			// 	policy = normalizePolicy(policy);

			// 	// If this is a top-level policy, apply it immediately
			// 	if (_.isArray(policy)) {

			// 		// If this controller is a container object, apply the policy to all the actions
			// 		if (_.isObject(self.middleware[id])) {
			// 			_.each(self.middleware[id], function(action, actionId) {
			// 				self.middleware[id][actionId] = policy.concat([self.middleware[id][actionId]]);
			// 			});
			// 		}

			// 		// Otherwise apply the policy directly to the controller
			// 		else if (_.isFunction(self.middleware[id])) {
			// 			self.middleware[id] = policy.concat([self.middleware[id]]);
			// 		}
			// 	}

			// 	// If this is NOT a top-level policy, and merely a container of other policies,
			// 	// iterate through each of this controller's actions and apply policies in a way that makes sense
			// 	else {
			// 		_.each(self.middleware[id], function(action, actionId) {

			// 			var actionPolicy = sails.config.policies[id][actionId];

			// 			// If a policy doesn't exist for this controller, use the controller-local '*'
			// 			if (_.isUndefined(actionPolicy)) {
			// 				actionPolicy = sails.config.policies[id]['*'];
			// 			}

			// 			// if THAT doesn't exist, use the global '*' policy
			// 			if (_.isUndefined(actionPolicy)) {
			// 				actionPolicy = sails.config.policies['*'];
			// 			}

			// 			// Normalize action policy to an array
			// 			actionPolicy = normalizePolicy(actionPolicy);

			// 			self.middleware[id][actionId] = actionPolicy.concat([self.middleware[id][actionId]]);
			// 		});
			// 	}

			// });
			// ////////////////////////////////////////////////////////

			cb();
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
				
				// Controller-level policy
				if ( ! util.isDictionary(_policy) ) {

					mapping[controllerId] = normalizePolicy(policy);
				}
				
				// Policy mapping contains a sub-object :: 
				// So we need to dive in and build/normalize the policy mapping from here
				mapping[controllerId] = {};
				_.each( _policy, function (__policy, actionId) {
					mapping[controllerId][actionId] = normalizePolicy(__policy);
				});
				
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
