module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var async = require('async'),
		util = require('sails-util'),
		Err = require('../../../errors');



	/**
	 * Expose `policies` hook definition
	 */

	var policyHookDef = {

		defaults: {

			// Default policy mappings (allow all)
			policies: { '*': true }
		},


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

			// Load policy modules
			sails.log.verbose('Loading policy modules from app...');
			sails.modules.loadPolicies(function modulesLoaded (err, modules) {
				if (err) return cb(err);
				// Register policies in `self.middleware`
				util.extend(self.middleware, modules);
				return cb();
			});
		},



		/**
		 * Curry the policy chains into the appropriate controller functions
		 *
		 * @api private
		 */

		bindPolicies: function() {

			// sails.log.verbose('Binding policies :: \n', this.mapping,
			// 	'\nto controllers :: \n', sails.middleware.controllers);

			// Policies can be bound to:
			//  -> controllers
			_bindPolicies(this.mapping, sails.middleware.controllers);

			// NOTE:
			// In the past, policies for views were bound here.
			//

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
					return policyHookDef.normalizePolicy(policy);
				}, this);

				// Then flatten the policy chain
				return util.flatten(policyChain);
			}

			// Look up the policy in the policy registry
			if ( util.isString(policy) ) {
				var policyFn = this.lookupFn(policy, 'config.policies');
        // Set the "policy" key on the policy function to the policy name, for debugging
        policyFn._middlewareType = 'POLICY: '+policy;
				return [policyFn];
			}

			// An explicitly defined, anonymous policy middleware can be directly attached
			if ( util.isFunction(policy) ) {

				var anonymousPolicy = util.clone(policy);
        // Set the "policy" key on the function name (if any) for debugging
        anonymousPolicy._middlewareType = 'POLICY: '+(anonymousPolicy.name || 'anonymous');
				return [anonymousPolicy];
			}

			// A false or null policy means NEVER allow any requests
			if (policy === false || policy === null) {
        var neverAllow = function neverAllow (req, res, next) {
          res.send(403);
        };
        neverAllow._middlewareType = 'POLICY: neverAllow';
				return [neverAllow];
			}

			// A true policy means ALWAYS allow requests
			if (policy === true) {
        var alwaysAllow = function alwaysAllow (req, res, next) {
          next();
        };
        alwaysAllow._middlewareType  = 'POLICY: alwaysAllow';
				return [alwaysAllow];
			}

			// If we made it here, the policy is invalid
			sails.log.error('Cannot map invalid policy: ', policy);
			return [function(req, res) {
				throw new Error('Invalid policy: ' + policy);
			}];
		},


		/**
		 * Bind a route directly to a policy
		 */
		bindDirectlyToRoute: function (event) {

			// Only pay attention to delegated route events
			// if `policy` is declared in event.target
			if ( !event.target || !event.target.policy ) {
				return;
			}

			// Bind policy function to route
			var fn = this.lookupFn(event.target.policy, 'config.routes');
			sails.router.bind(event.path, fn, event.verb);
		},


		/**
		 * @param {String} policyId
		 * @param {String} referencedIn [optional]
		 *	- where the policy identity is being referenced, for providing better error msg
		 * @returns {Function} the appropriate policy middleware
		 */
		lookupFn: function (policyId, referencedIn) {

			// Case-insensitive
			policyId = policyId.toLowerCase();

			// Policy doesn't exist
			if ( !this.middleware[policyId] ) {
				return Err.fatal.__UnknownPolicy__ (policyId, referencedIn, sails.config.paths.policies);
			}

			// Policy found
			return this.middleware[policyId];
		}

	};

	/**
	 * Bind routes for manually-mapped policies from `config/routes.js`
	 */
	sails.on('route:typeUnknown', function (ev) {
		policyHookDef.bindDirectlyToRoute(ev);
	});

	return policyHookDef;


	/**
	 * Bind a set of policies to a set of controllers
	 * (prepend policy chains to original middleware)
	 */
	function _bindPolicies ( mapping, middlewareSet ) {
		util.each(middlewareSet, function (_c, id) {

			var topLevelPolicyId = mapping[id];
			var actions, actionFn;
			var controller = middlewareSet[id];

			// If a policy doesn't exist for this controller, use '*'
			if ( util.isUndefined(topLevelPolicyId) ) {
				topLevelPolicyId = mapping['*'];
			}

			// sails.log.verbose('Applying policy :: ', topLevelPolicyId, ' to ', id);

			// Build list of actions
			if ( util.isDictionary(controller) ) {
				actions = util.functions(controller);
			}

			// If this is a controller policy, apply it immediately
			if ( !util.isDictionary(topLevelPolicyId) ) {

				// :: Controller is a container object
				// -> apply the policy to all the actions
				if ( util.isDictionary(controller) ) {
					// sails.log.verbose('Applying policy (' + topLevelPolicyId + ') to controller\'s (' + id + ') actions...');
					util.each(actions, function(actionId) {
						actionFn = controller[actionId];
						controller[actionId] = topLevelPolicyId.concat([actionFn]);
						// sails.log.verbose('Applying policy to ' + id + '.' + actionId + '...', controller[actionId]);
					}, this);
					return;
				}

				// :: Controller is a function
				// -> apply the policy directly
				// sails.log.verbose('Applying policy (' + topLevelPolicyId + ') to top-level controller middleware fn (' + id + ')...');
				middlewareSet[id] = topLevelPolicyId.concat(controller);
			}

			// If this is NOT a top-level policy, and merely a container of other policies,
			// iterate through each of this controller's actions and apply policies in a way that makes sense
			else {
				util.each(actions, function(actionId) {

					var actionPolicy = mapping[id][actionId];
					// sails.log.verbose('Mapping policies to actions.... ', actions);

					// If a policy doesn't exist for this controller/action, use the controller-local '*'
					if ( util.isUndefined(actionPolicy) ) {
						actionPolicy = mapping[id]['*'];
					}

					// if THAT doesn't exist, use the global '*' policy
					if ( util.isUndefined(actionPolicy) ) {
						actionPolicy = mapping['*'];
					}
					// sails.log.verbose('Applying policy (' + actionPolicy + ') to action (' + id + '.' + actionId + ')...');

					actionFn = controller[actionId];
					controller[actionId] = actionPolicy.concat([actionFn]);
				}, this);
			}

		});
	}

};
