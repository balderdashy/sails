module.exports = {
	
	// (Note: global blueprint config may be overridden on a per-controller basis
	//			by setting the 'blueprint' property in a controller)
	blueprints: {

		// Optional mount path prefix for blueprint routes
		// e.g. '/api/v2'
		prefix: '',


		// Routes to automatically inject
		routes: {

			// Automatically create routes for every action in the controller
			// (also maps `index` to /:controller)
			'get /:controller/:action?': true,
			'post /:controller/:action?': true,
			'put /:controller/:action?': true,
			'delete /:controller/:action?': true,


			// REST shortcuts
			//
			// ** NOTE **
			// These REST shortcuts exist for your convenience during development,
			// but you'll want to disable them in production.
			'/:controller/find/:id?': true,
			'/:controller/create': true,
			'/:controller/update/:id': true,
			'/:controller/destroy/:id': true,


			// REST methods
			'get /:controller/:id?': true,
			'post /:controller': true,
			'put /:controller/:id': true,
			'delete /:controller/:id': true

		},


		// If a blueprint REST route catches a request,
		// only match an `id` if it's an integer
		//
		// e.g.	only fire route if requests look like:
		//		get /user/8
		// instead of:
		//		get /user/a8j4g9jsd9ga4ghjasdha
		expectIntegerId: true

	},
	
	
	// CSRF middleware protection, all non-GET requests must send '_csrf' parmeter
	// _csrf is a parameter for views, and is also available via GET at /csrfToken
	csrf: false

};