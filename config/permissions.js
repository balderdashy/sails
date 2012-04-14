var policy = AuthenticationService;



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




//
//// Behavior is inherited from parent unless otherwise specified
//var permissionTree = {
//	
//	// app-wide default behavior
//	'*': allow,
//	
//	// Controller authentication patterns
//	example: {
//		// Default behavior for this controller
//		'*': '/500',
//		
//		summary: allow,
//		detail: allow,
//		
//		update: [
//			
//			// Case
//			{
//				and: [
//					isAdministrator,
//					isMine
//				],
//				then:allow
//			},
//			
//			// Default
//			'/403'
//		]
//	}
//}




