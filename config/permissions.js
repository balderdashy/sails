// Some basic authentication middleware is bundled in the AuthenticationService
var policy = AuthenticationService.policy;



// User access settings are inherited from defaults, which you can override here
exports.accessControlTree = function () {
	
	return {
		
		'*': true,
		
		settings: {
			"*":policy.any
		},
		
		admin: {
			'*': policy.only('admin')
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