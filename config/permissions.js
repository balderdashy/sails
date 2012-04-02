
// Behavior is inherited from parent unless otherwise specified
exports.acTree = function () {
	
	return {
		// app-wide default behavior
		'*': true,

		// Controller authentication patterns
		example: {
			// Default behavior for this controller
//			'*': false,

			summary: true,
			detail: false
		}
		
	}
}


// Default AcTree
exports.acTree = function () {
	return {
		auth: {
			login: true,
			logout: AuthenticationService.reverse
		},
		meta: {
			denied: true,
			error: true,
			notfound: true
			// 403 is hard-coded enabled
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




