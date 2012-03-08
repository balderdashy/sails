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
		
		
		// Public API
		'/read*': controllers.node.readRequest
		, '/load*': controllers.node.loadRequest
		, '/content/fetch*': controllers.node.fetchRequest
		, '/content/load*': controllers.node.loadRequest
		, '/content/read*': controllers.node.readRequest

		// JS SDK
		, '/crud.io.client.js': controllers.sdk.javascript

		// Private (crud.io CMS) convenience mappings
		, '/nodes': controllers.node.index
		, '/sitemap': controllers.page.index
		
		// Authentication mappings
		, '/login' :controllers.auth.login
		, '/logout' :controllers.auth.logout
	}
};

exports.authMappings = function (controllers) {
	return {
		// Private CMS actions
		'/': controllers.auth.basic
		, '/node*': controllers.auth.basic
		, '/page*': controllers.auth.basic
		
		// Private (crud.io CMS) convenience mappings
		, '/nodes': controllers.auth.basic
		, '/sitemap': controllers.auth.basic
		
		// Authentication mappings
		, '/login' : controllers.auth.reverse
		, '/logout' : controllers.auth.basic
	}
}