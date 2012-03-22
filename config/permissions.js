


// Behavior is inherited from parent unless otherwise specified
exports.permissionTree = function (everyone) {
	
	return {
		// app-wide default behavior
		'*': everyone.allow,

		// Controller authentication patterns
		example: {
			// Default behavior for this controller
			'*': everyone.deny,

			summary: 'allow',
			detail: 'allow'
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




