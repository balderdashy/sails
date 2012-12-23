/**
* Policies are middleware that are run before a URL is routed to a controller.
* Any policy dropped into the /policies directory is made available through sails.policies
*/
var policy = sails.policies;

module.exports = {

	// Default policy
	'*': true,

	// Policy mapping for the home page
	meta: {
		home: true
	}

	/** Example mapping: 
	someController: {

		// Apply the "authenticated" policy to all actions
		'*': policy.authenticated,

		// For someAction, apply "somePolicy" instead
		someAction: policy.somePolicy
	}
	*/
};