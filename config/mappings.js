// Custom URL mappings
// *********************
// 
// Use for situations where:
//		/controllerName/methodName
// is not enough
// 
// You can override default url mappings (404,500,home) here as well.
//
exports.customMappings = function (controllers) {
	
	return {
		// Authentication mappings
		'/login' :controllers.auth.login
		, '/logout' :controllers.auth.logout
	}
};


// Container security mappings
// *********************
// Protect a url path expression using a specified middleware method
//
exports.authMappings = function (controllers) {
	return {
		// Authentication mappings
		'/login' : controllers.auth.reverse
		, '/logout' : controllers.auth.basic
	}
}



// Permission table
// Control functionality by application, controller, role, and custom middleware
// 
// The goal of doing it this way is to have complete confidence within your
// controller actions that the account which is accessing this functionailty
// has the full permission to use it.
// 
// It also allows you to segment out that kind of context-dependent business logic
// out of the controller and into the route negotiation step.
// 
// Example:
// Project (Defaults)
	// Controller (Target)
		// Action (Verb)
			// Account Type (Build-time role permissions)
				// Custom (Runtime predicates based on user and object state)


// Global default

// I'm doing something to something
// What am I doing it to?


//// Account Types
//var accountTypes = [
//	'admin',
//	'presenter',
//	'guest'
//]
//
//
//	// Permissions
//var d = {
//	file: {
//		'*': '/login',
//		
//		// I'm doing something to a file
//		// What am I doing?
//		
//		read: {
//			'*': '/login'
//		},
//		
//		update: {
//			
//			// I'm updating a file
//			// What kind of account do I have?
//			
//			presenter: {
//				
//				'*': auth.allow,
//				
//				// OK I'm updating a file with a presenter account
//				// Am I allowed to do it?  What is it?  Who am I?
//				// If not, where should I be redirected?
//				conditionList: [
//					{
//						'if': {
//							{not: 'amIBanned'}
//						},
//						then: auth.allow
//					},
//					{
//						'if': {
//							or: {
//								not: isFileLocked,
//								isFileLocked
//							}
//						},
//						then: '/yourfilehasbeenlocked'
//						or: {
//							not: {
//								isFileLocked: '/yourfilehasbeenlocked',
//							},
//							isFileLocked: '/yourfilehasbeenlocked'
//						}
//					},
//					{
//						isThisMyFile: auth.allow
//					}
//				]	
//				
//				
//				
//				
//				
//			},
//			organizer: auth.deny
//		},
//		create: {},
//		'delete': {}
//	}
//}
//	
//	
