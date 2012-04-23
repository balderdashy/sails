// Custom URL mappings
// *********************
// 
// Use for situations where:
//		/controllerName/methodName
// and backbone semantics (routing by HTTP verb) are not enough
// 
// You can override default url mappings (404,500,home) here as well.
//
exports.customMappings = function () {
	
	return {
		
		// Authentication mappings
		'/login': {
			controller: 'auth',
			action: 'login'
		}
		, '/logout': {
			controller: 'auth',
			action: 'logout'
		}
		, '/register': {
			controller: 'auth',
			action: 'register'
		}
//		, '/403': '/login'
	}
};


exports.defaultMappings = function () {
	return {
		'/': {controller:'meta',action:'home'},
		'/500': {controller:'meta',action:'error'}, 
		'/404': {controller:'meta',action:'notfound'},
		'/403': {controller:'meta',action:'denied'}
	};
}
