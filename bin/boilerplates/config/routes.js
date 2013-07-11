/**
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence:
 *
 */


/**
 * (1) Static routes
 *
 * This object routes static URLs to handler functions--
 * In most cases, these functions are actions inside of your controllers.
 *
 */

module.exports.routes = {
	
	// To route the home page to the "index" action of FooController
	// (if no controller exists, Sails will look for a view called `views/home/index.*`)
	'/' : {
	    controller  : 'home'
	}

	// If you want to set up a route only for a particular HTTP method/verb 
	// (GET, POST, PUT, DELETE) you can specify the verb before the path:
	// 'post /signup': {
	//		controller	: 'user',
	//		action		: 'signup'
	// }
};



/**
 * (2) Static assets
 *
 * Flat files in your `assets` directory- (these are sometimes referred to as 'public')
 * If you have an image file at `/assets/images/foo.jpg`, it will be made available 
 * automatically via the route:  `/images/foo.jpg`
 *
 */



/**
 * (3) Action blueprints
 *
 * These routes can be disabled by setting (in config/controllers.js):
 *		`module.exports.controllers.routes.actions = false`
 *
 * All of your controllers' actions are automatically bound to a route.  For example:
 *   + If you have a controller, `FooController`:
 *     + its action `bar` is accessible at `/foo/bar`
 *     + its action `index` is accessible at `/foo/index`, and also `/foo`
 */


 /**
 * (4) View blueprints
 *
 * These routes can be disabled by setting (in config/controllers.js):
 *		`module.exports.views.routes = false`
 *
 * If you have a view file at `/views/foo/bar.ejs`, it will be rendered and served 
 * automatically via the route:  `/foo/bar`
 *
 */

 /**
 * (5) Shortcut CRUD blueprints
 * 
 * These routes can be disabled by setting (in config/controllers.js)
 *			`module.exports.controllers.routes.shortcuts = false`
 *
 * If you have a model, `Foo`, and a controller, `FooController`, 
 * you can access CRUD operations for that model at:
 *		/foo/find/:id?	->	search lampshades using specified criteria or with id=:id
 *
 *		/foo/create		->	create a lampshade using specified values
 *				
 *		/foo/update/:id	->	update the lampshade with id=:id
 *				
 *		/foo/destroy/:id	->	delete lampshade with id=:id
 *				
 */

 /**
 * (6) REST blueprints
 * 
 * These routes can be disabled by setting (in config/controllers.js)
 *		`module.exports.controllers.routes.rest = false`
 *
 * If you have a model, `Foo`, and a controller, `FooController`, 
 * you can access CRUD operations for that model at:
 *
 *		get /foo/:id?	->	search lampshades using specified criteria or with id=:id
 *
 *		post /foo		-> create a lampshade using specified values
 *
 *		put /foo/:id	->	update the lampshade with id=:id
 *
 *		delete /foo/:id	->	delete lampshade with id=:id
 *
 */




/**
 * (7) Default 404 (not found) handler
 *
 * If no matches are found, Sails will respond using this handler:
 *
 */

module.exports[404] = function notFound (req, res, defaultNotFoundBehavior) {
	
	// Respond to request, respecting any attempts at content negotiation
	if (req.wantsJSON) {
		res.send(404);
	}

	// If the clients wants HTML, send the `views/404.*` page by default
	else res.view('404');
};




/**
 * (!) Default server error handler
 *
 * If an error is thrown, Sails will respond using this default
 * 500 (server error) handler
 */

module.exports[500] = function (errors, req, res, defaultErrorBehavior) {

	// Ensure that `errors` is a list
	var displayedErrors = (typeof errors !== 'object' || !errors.length ) ?
		[errors] :
		errors;

	// Ensure that each error is formatted correctly
	// Then log them
	for (var i in displayedErrors) {
		if (!displayedErrors[i] instanceof Error) {
			displayedErrors[i] = require('util').inspect(new Error(displayedErrors[i]));
			sails.log.error(displayedErrors[i]);
		}
	}

	// In production, don't display any identifying information about the error(s)
	var response = {};
	if (sails.config.environment === 'development') {
		response = {
			errors: displayedErrors
		};
	}

	// Respond to request, respecting any attempts at content negotiation
	if (req.wantsJSON) {
		res.json(response, 500);
	}

	// If the clients wants HTML, send the `views/500.*` page by default
	else res.view('500', response);
	
};