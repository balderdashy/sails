// policies.js
// --------------------
//
// Run policies in order for a given controller/action pair
//

// Export runPolicy behavior
module.exports = runPolicy;

// Determine route plan for incoming requests based on policy
//	-> controllerName
//	-> actionName
//	-> req
//	-> res
//	-> next - the actual controller action fn underneath this policy
function runPolicy(controllerName, actionName, req, res, next) {

	// TODO: move this to configuration.js so the server won't be allowed to start w/ invalid policies
	if (!sails.config.policies || !_.isObject(sails.config.policies) || _.isUndefined(sails.config.policies['*'])) {
		sails.log.error('Invalid policy configuration: Missing default * policy!');
		console.log(sails.config.policies);
		process.exit(1);
	}

	// The routing directions
	var routePlan = sails.config.policies;

	// Determine which policies apply directly to this request

	// policy for this controller
	var cPolicy = sails.config.policies[controllerName]; 
	if (!_.isUndefined(cPolicy)) {
		routePlan = cPolicy;

		// If policy is an object (but not an array), check if action exists
		if (!_.isArray(routePlan) && _.isObject(routePlan)) {

			// Check policy for this action within the controller policy map
			var aPolicy = routePlan[actionName];
			if (!_.isUndefined(aPolicy)) {
				routePlan = aPolicy;
			}
			// If no action OR * policy is defined, use top-level policy
			else if (_.isUndefined(routePlan['*'])) {
				routePlan = sails.config.policies;
			}
			// Otherwise, use the object itself (since a * is defined)
		}
	}

	// Build policy chain
	// (convert routePlan into executable chain)
	routePlan = buildPolicyChain(routePlan, req, res, next);

	// Initiate policy chain
	// (req,res, and appropriate next action 
	//	are already bound at this point)
	routePlan();
}

// Build a chain of policies using 'policies' resulting in 'afterwards'
// returns a function which kicks the chain off
function buildPolicyChain(policies, req, res, afterwards) {

	// If policies are not a list, turn them into one
	if (!_.isArray(policies)) policies = [policies];

	// Keep track of middleware chain
	var chain = afterwards;

	// Iterate through policies and build function chain
	for (var i=policies.length-1; i >= 0; i--) {

		// Get actual policy function for this policy definition
		var thisPolicy = interpretPolicy( policies[i] );

		// Set up chain to call next middleware after itself
		chain = _.bind(thisPolicy, {}, req, res, chain);
	}

	return chain;
}


// Interpret a policy defintion as a chainable policy function
function interpretPolicy(policy) {

	// Disambiguate fully qualified policy objects (e.g. {'*': 'foo'} )
	if (!_.isArray(policy) && !_.isFunction(policy) && _.isObject(policy)) {
		policy = policy['*'];
	}

	// Publicly accessible: anyone can access
	if (policy === true) return function (req,res,next) {
		next();
	};

	// Globally disabled: no one can access
	else if (policy === false) return function (req,res,next) {
		return res.send("Sorry, this action has been globally disabled using a 'false' policy config.",403);
	};

	// Inline policy
	else if (_.isFunction(policy)) return policy;

	// Named policy: look up policy logic by name
	else if (_.isString(policy)) {
		
		// use it if it exists
		if (sails.policies[policy.toLowerCase()]) {
			return sails.policies[policy.toLowerCase()];
		}
		else return function (req,res,next) {
			return res.send('Sorry, the specified policy ('+policy+') does not exist.',500);
		};
	}

	// Unknown policy
	else {
		var message = "Invalid entry ("+policy+") in policy configuration!";
		sails.log.error(policy,"::",message);
		return function (req,res,next) {
			res.send(message, 500);
		};
	}
}