// Routes
// *********************
// 
// This table routes urls to controllers/actions.
//
// If the URL is not specified here, the default route for a URL is:  /:controller/:action/:id
// where :controller, :action, and the :id request parameter are derived from the url
//
// If :action is not specified, Sails will redirect to the appropriate action 
// based on the HTTP verb: (using REST/Backbone conventions)
//
//		GET:	/:controller/read/:id
//		POST:	/:controller/create
//		PUT:	/:controller/update/:id
//		DELETE:	/:controller/destroy/:id
//
// If the requested controller/action doesn't exist:
//   - if a view exists ( /views/:controller/:action.ejs ), Sails will render that view
//   - if no view exists, but a model exists, Sails will automatically generate a 
//       JSON API for the model which matches :controller.
//   - if no view OR model exists, Sails will respond with a 404.
//
module.exports.routes = {
	
	// Routes look like:
	// '/whateverYouWant': {
	//		controller	: 'someController',
	//		action		: 'someAction'
	// }

	// To route the home page:
	// '/' : {
	//		controller	: 'someController',
	//		action		: 'someAction'
	// }

	// If you want to set up a route only for a particular HTTP method/verb 
	// (GET, POST, PUT, DELETE) you can specify the verb before the path:
	// 'post /signup': {
	//		controller	: 'auth',
	//		action		: 'signup'
	// }

	// Keep in mind default routes exist for each of your controllers
	// So if you have a UserController with an action called "juggle" 
	// a route will be automatically exist mapping it to /user/juggle.
	//
	// Additionally, unless you override them, new controllers will have 
	// create(), find(), findAll(), update(), and destroy() actions, 
	// and routes will exist for them as follows:
	/*

	'/user': {
		controller	: 'user',
		action		: 'findAll'
	}
	'/user/:id': {
		controller	: 'user',
		action		: 'find'
	}
	'/user/create': {
		controller	: 'user',
		action		: 'create'
	}
	'/user/find': {
		controller	: 'user',
		action		: 'find'
	}
	'/user/findAll': {
		controller	: 'user',
		action		: 'findAll'
	}
	'/user/update': {
		controller	: 'user',
		action		: 'update'
	}
	'/user/destroy': {
		controller	: 'user',
		action		: 'destroy'
	}
	*/
};