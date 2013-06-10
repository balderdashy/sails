/**
 * Module dependencies.
 */

// global: sails

var _ = require( 'lodash' );

/**
 * Expose `MiddlewareRegistry` constructor.
 */

module.exports = MiddlewareRegistry;



/**
 * Simple view middleware used to serve views w/o controllers
 */

function ViewMiddleware (req,res) {
	res.view();
}


/**
 * Initialize a new `MiddlewareRegistry`
 *
 * @param {Object} options
 * @api private
 */

function MiddlewareRegistry ( options ) {

	MiddlewareRegistry.prototype.log = sails.log;
}



/**
 * Wipe everything and (re)load middleware from controllers, policies, config, and views.
 * This gives us something to route *to* and allows us to lots of fancy things later.
 *
 * @api private
 */

MiddlewareRegistry.prototype.flush = function ( ) {
	

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
			if ( _.isFunction(this[controllerId]) ) {
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

	}

	else if (policy === true) {

	}
	
	sails.log.error('Cannot map invalid policy: ', policy);
	return [function (req,res) {
		throw new Error('Invalid policy: ' + policy);
	}];
}


