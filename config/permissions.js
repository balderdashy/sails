var policy = AuthenticationService.policy;



// Behavior is inherited from default access settings unless otherwise specified
// User access settings
exports.accessControlTree = function () {
	
	return {
		// app-wide default behavior
		'*': true,

		// Controller authentication patterns
		example: {
			// Default behavior for this controller
			'*': policy.only('developer'),

			summary: true,
			detail: policy.any
		}
		
	}
}




// Default access settings
exports.defaultAccessControlTree = function () {
	return {
		auth: {
			login: policy.inverse,
			register: policy.inverse,
			logout: policy.any
		},
		meta: {
			denied: true,
			error: true,
			notfound: true
			// 403 is hard-coded to be enabled
		}
	}
	
}