module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var _		= require( 'lodash' ),
		async	= require( 'async' );



	/**
	 * * Expose new instance of `MiddlewareRegistry`
	 *
	 * @api private
	 */

	return new MiddlewareRegistry();




	/**
	 * Initialize a new `MiddlewareRegistry`
	 *
	 * @param {Object} options
	 * @api private
	 */

	function MiddlewareRegistry ( options ) {


		/**
		 * Wipe everything and (re)load middleware from controllers, policies, config, and views.
		 * This gives us stuff to route *to* and allows us to lots of fancy things later.
		 *
		 * @api private
		 */

		this.load = function (cb) {

			sails.log.verbose('Building middleware registry...');
			
			// Save reference to Sails logger
			this.log = sails.log;

			// Save self-reference in sails
			sails.middleware = this;


			async.auto({
			
				controllers: function (cb) {
					sails.log.verbose('Loading app controllers...');

					// Load app controllers
					sails.controllers = require('../moduleloader').optional({
						dirname		: sails.config.paths.controllers,
						filter		: /(.+)Controller\.(js|coffee)$/,
						replaceExpr	: /Controller/
					});

					// Get federated controllers where actions are specified each in their own file
					var federatedControllers = require('../moduleloader').optional({
						dirname			: sails.config.paths.controllers,
						pathFilter		: /(.+)\/(.+)\.(js|coffee)$/
					});
					sails.controllers = _.extend(sails.controllers,federatedControllers);

					cb();
				}, 

				policies: function (cb) {
					sails.log.verbose('Loading app policies...');

					// Load policy modules
					sails.policies = require('../moduleloader').optional({
						dirname		: sails.config.paths.policies,
						filter		: /(.+)\.(js|coffee)$/,
						replaceExpr	: null
					});
					cb();
				},

				views: function (cb) {

					// Load views, just so we know whether they exist or not
					sails.views = require('../moduleloader').optional({
						dirname		: sails.config.paths.views,
						filter		: /(.+)\..+$/,
						replaceExpr	: null,
						dontLoad	: true
					});
					cb();
				},

				buildRegistry: ['controllers', 'policies', 'views', function (cb) {
					sails.log.verbose('Building middleware registry...');

					// Populate middleware registry using controllers, policies, and views
					sails.middleware.flush();

					cb();
				}]

			}, cb);
		};


		/**
		 * Wipe everything and (re)load middleware from controllers, policies, and views.
		 * This gives us something to route *to* and allows us to lots of fancy things later.
		 *
		 * @api private
		 */

		this.flush = function ( ) {
			

			////////////////////////////////////////////////
			// (LEGACY SUPPORT)
			// Register policies
			_.extend(this, sails.policies);
			////////////////////////////////////////////////

			// If there are any matching views which don't have an action
			// create middleware to serve them
			_.each(sails.views, function (view, controllerId) {

				// Create middleware for a top-level view
				if (view === true) {
					this[controllerId] = ViewMiddleware;
				}

				// Create middleware for each subview
				else {
					this[controllerId] = {};
					for (var actionId in sails.views[controllerId]) {
						this[controllerId][actionId] = ViewMiddleware;
					}
				}

			}, this);

			// Register controllers
			_.each(sails.controllers, function (controller, controllerId) {

				// Override whatever was here before
				if (!_.isObject(this[controllerId])) {
					this[controllerId] = {};
				}
				
				// Mix in middleware from controllers
				_.each(controller, function (action, actionId) {

					// If the action is set to `false`, explicitly disable it
					if (action === false) {
						delete this[controllerId][actionId];
					}

					// Otherwise mix it in
					else if (_.isFunction(action)) {
						this[controllerId][actionId] = action;
					}

				}, this);

				////////////////////////////////////////////////////////
				// (LEGACY SUPPORT)
				// Prepend policies to chain, as per policy configuration

				var controllerPolicy = sails.config.policies[controllerId];
				
				// If a policy doesn't exist for this controller, use '*'
				if ( _.isUndefined(controllerPolicy) ) {
					controllerPolicy = sails.config.policies['*'];
				}
				
				// Normalize policy to an array
				controllerPolicy = normalizePolicy( controllerPolicy );

				// If this is a top-level policy, apply it immediately
				if ( _.isArray(controllerPolicy) ) {

					// If this controller is a container object, apply the policy to all the actions
					if ( _.isObject(this[controllerId]) ) {
						_.each(this[controllerId], function (action, actionId) {
							  this[controllerId][actionId] = controllerPolicy.concat([this[controllerId][actionId]]);
						}, this);
					}

					// Otherwise apply the policy directly to the controller
					else if ( _.isFunction(this[controllerId]) ) {
						this[controllerId] = controllerPolicy.concat([this[controllerId]]);
					}
				}
				
				// If this is NOT a top-level policy, and merely a container of other policies,
				// iterate through each of this controller's actions and apply policies in a way that makes sense
				else {
					_.each(this[controllerId], function (action, actionId) {

						var actionPolicy =	sails.config.policies[controllerId][actionId];
						
						// If a policy doesn't exist for this controller, use the controller-local '*'
						if ( _.isUndefined(actionPolicy) ) {
							actionPolicy = sails.config.policies[controllerId]['*'];
						}

						// if THAT doesn't exist, use the global '*' policy
						if ( _.isUndefined(actionPolicy) ) {
							actionPolicy = sails.config.policies['*'];
						}

						// Normalize action policy to an array
						actionPolicy = normalizePolicy( actionPolicy );

						this[controllerId][actionId] = actionPolicy.concat([this[controllerId][actionId]]);
					}, this);
				}

				////////////////////////////////////////////////////////

			}, this);
		};



		/**
		 * Convert policy into array notation
		 *
		 * @param {Object} options
		 * @api private
		 */

		function normalizePolicy ( policy ) {

			// Recursively normalize lists of policies
			if (_.isArray(policy)) {
				for (var i in policy) {
					normalizePolicy(policy[i]);
				}
				return policy;
			}
			
			else if (_.isString(policy) || _.isFunction(policy)) {
				return [ policy ];
			}
			
			else if (!policy) {
				return [ function (req,res,next) { res.send(403); } ];
			}

			else if (policy === true) {
				return [ function (req,res,next) { next(); } ];
			}
			
			sails.log.error('Cannot map invalid policy: ', policy);
			return [function (req,res) {
				throw new Error('Invalid policy: ' + policy);
			}];
		}



		/**
		 * Simple view middleware used to serve views w/o controllers
		 */

		function ViewMiddleware (req,res) {
			res.view();
		}


		
		// Bind the context of all instance methods
		_.bindAll(this);

	}

};
