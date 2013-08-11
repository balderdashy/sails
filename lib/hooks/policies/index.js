module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var async = require('async'),
		util = require('../../util'),
		Modules = require('../../moduleloader');


	/**
	 * Expose `policies` hook definition
	 */

	var policyDef = {

		// Don't allow sails to lift until ready 
		// is explicitly set below
		ready: false,


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
			util.extend(self.middleware, modules);

			cb();
		},



		/**
		 * Curry the policy chains into the appropriate controller functions
		 *
		 * @api private
		 */

		bindPolicies: function() {

			sails.log.verbose('Binding policies :: \n', this.mapping, 
				'\nto controllers :: \n', sails.middleware.controllers);

			// Policies can be bound to:
			//  -> controllers
			_bindPolicies(this.mapping, sails.middleware.controllers);

			//  -> and auto view-serving middleware
			_bindPolicies(this.mapping, sails.middleware.views);

			// Emit event to let other hooks know we're ready to go
			sails.log.verbose('Policy-controller bindings complete!');
			sails.emit('hook:policies:bound');
			

			this.ready = true;	
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
			util.each(sails.config.policies, function (_policy, controllerId) {

				// Accept `FooController` or `foo`
				// Case-insensitive
				controllerId = util.normalizeControllerId(controllerId);
				
				// Controller-level policy ::
				// Just map the policy to the controller directly
				if ( ! util.isDictionary(_policy) ) {
					mapping[controllerId] = this.normalizePolicy(_policy);
					return;
				}
				
				// Policy mapping contains a sub-object :: 
				// So we need to dive in and build/normalize the policy mapping from here
				// Mapping each policy to each action for this controller
				mapping[controllerId] = {};
				util.each( _policy, function (__policy, actionId) {

					// Case-insensitive
					actionId = actionId.toLowerCase();

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
			if ( util.isArray(policy) ) {

				var policyChain = util.clone(policy);

				// Normalize each policy in the chain
				policyChain = util.map(policyChain, function normalize_each_policy (policy) {
					return policyDef.normalizePolicy(policy);
				}, this);

				// Then flatten the policy chain
				return util.flatten(policyChain);
			}

			// Look up the policy in the policy registry
			if ( util.isString(policy) ) {

				// Case-insensitive
				policy = policy.toLowerCase();

				// Handle case where specified policy is unknown
				if ( !this.middleware[policy] ) {
					var unknownPolicyError = 'Unknown policy, `' + policy + '`, in configuration!';
					sails.log.error(unknownPolicyError);
					throw new Error(unknownPolicyError);
				}
				
				var lookedUpPolicy = util.clone(this.middleware[policy]);
				return [lookedUpPolicy];
			}
			
			// An explicitly defined, anonymous policy middleware can be directly attached
			if ( util.isFunction(policy) ) {

				var anonymousPolicy = util.clone(policy);
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

	return policyDef;


	/**
	 * Bind a set of policies to a set of middleware
	 * (prepend policy chains to original middleware)
	 */
	function _bindPolicies ( mapping, middlewareSet ) {
		util.each(middlewareSet, function (_c, id) {

			var policy = mapping[id];
			var actions, actionFn;
			var controller = middlewareSet[id];

			// If a policy doesn't exist for this controller, use '*'
			if ( util.isUndefined(policy) ) {
				policy = mapping['*'];
			}

			sails.log.verbose('Applying policy :: ', policy, ' to ', id);

			// Build list of actions
			if ( util.isDictionary(controller) ) {
				actions = util.functions(controller);
			}

			// If this is a controller policy, apply it immediately
			if ( !util.isDictionary(policy) ) {

				// :: Controller is a container object
				// -> apply the policy to all the actions
				if ( util.isDictionary(controller) ) {
					sails.log.verbose('Applying policy (' + policy + ') to controller\'s (' + id + ') actions...');
					util.each(actions, function(actionId) {
						actionFn = controller[actionId];
						controller[actionId] = policy.concat([actionFn]);
						sails.log.verbose('Applying policy to ' + id + '.' + actionId + '...', controller[actionId]);
					}, this);
					return;
				}

				// :: Controller is a function
				// -> apply the policy directly
				sails.log.verbose('Applying policy (' + policy + ') to top-level controller middleware fn (' + id + ')...');
				middlewareSet[id] = policy.concat(controller);
			}

			// If this is NOT a top-level policy, and merely a container of other policies,
			// iterate through each of this controller's actions and apply policies in a way that makes sense
			else {
				util.each(actions, function(actionId) {

					var actionPolicy = mapping[id][actionId];
					sails.log.verbose('Mapping policies to actions.... ', actions);

					// If a policy doesn't exist for this controller, use the controller-local '*'
					if ( util.isUndefined(actionPolicy) ) {
						actionPolicy = mapping[id]['*'];
					}

					// if THAT doesn't exist, use the global '*' policy
					if ( util.isUndefined(actionPolicy) ) {
						actionPolicy = mapping['*'];
					}
					sails.log.verbose('Applying policy (' + actionPolicy + ') to action (' + id + '.' + actionId + ')...');

					actionFn = controller[actionId];
					controller[actionId] = actionPolicy.concat([actionFn]);
				}, this);
			}

		});
	}

};
