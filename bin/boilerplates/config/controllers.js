module.exports.controllers = {
	
	// Routes to automatically inject
	// (Note: global blueprint config may be overridden on a per-controller basis
	//			by setting the 'blueprint' property in a controller)
	routes: {

		// Optional mount path prefix for blueprint routes
		// e.g. '/api/v2'
		prefix: '',
		

		// Whether routes are automatically generated for every action in your controllers
		// (also maps `index` to /:controller)
		// '/:controller', '/:controller/index', and '/:controller/:action'
		actions: true,


		// ** NOTE **
		// These CRUD shortcuts exist for your convenience during development,
		// but you'll want to disable them in production.
		// '/:controller/find/:id?'
		// '/:controller/create'
		// '/:controller/update/:id'
		// '/:controller/destroy/:id'
		shortcuts: true,


		// Automatic REST blueprints enabled?
		// e.g.
		// 'get /:controller/:id?'
		// 'post /:controller'
		// 'put /:controller/:id'
		// 'delete /:controller/:id'
		rest: true,


		// If a blueprint route catches a request,
		// only match :id param if it's an integer
		//
		// e.g.	only trigger route handler if requests look like:
		//		get /user/8
		// instead of:
		//		get /user/a8j4g9jsd9ga4ghjasdha
		expectIntegerId: false
	},
	
	
	// CSRF middleware protection, all non-GET requests must send '_csrf' parmeter
	// _csrf is a parameter for views, and is also available via GET at /csrfToken
	csrf: false

};
