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
		, '/tj': {
			controller: 'settings',
			action: 'testjson'
		}
		, '/403': '/login'
		
		
		// Temporary mappings b/c of socket.io wildcard deficiency
		, '/experiment/fetch': {
			controller: 'experiment',
			action: 'fetch'
		}
		, '/experiment/findAll': {
			controller: 'experiment',
			action: 'findAll'
		}
		, '/experiment/find': {
			controller: 'experiment',
			action: 'find'
		}
		, '/experiment/destoy': {
			controller: 'experiment',
			action: 'destroy'
		}
		, '/experiment/create': {
			controller: 'experiment',
			action: 'create'
		}
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
