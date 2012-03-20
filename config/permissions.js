

// Behavior is inherited from parent unless otherwise specified

var permissionTree = {
	// app-wide default behavior
	'*': allow,
	
	// Controller authentication patterns
	example: {
		// Default behavior for this controller
		'*': '/500',
		
		summary: allow,
		detail: allow
	}
}




var allow = function () {
	// TODO: Allow browser to access controller
}