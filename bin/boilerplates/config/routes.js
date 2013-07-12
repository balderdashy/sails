/**
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */



/**
 * (1) Static assets
 *
 * Flat files in your `assets` directory- (these are sometimes referred to as 'public')
 * If you have an image file at `/assets/images/foo.jpg`, it will be made available 
 * automatically via the route:  `/images/foo.jpg`
 *
 */




/**
 * (2) Static routes
 *
 * This object routes static URLs to handler functions--
 * In most cases, these functions are actions inside of your controllers.
 * For convenience, you can also connect routes directly to views or external URLs.
 *
 */

module.exports.routes = {
	
	// By default, your root route (aka home page) points to a view
	// located at `views/home/index.ejs`
	// 
	// (This would also work if you had a file at: `/views/home.ejs`)
	'/' : {
	    view  : 'home'
	}


	/*
	// But what if you want your home page to display
	// a signup form located at `views/user/signup.ejs`?
	'/'	: {
		view : 'user/signup'
	}


	// Let's say you're building an email client, like Gmail
	// You might want your home route to serve an interface using custom logic.
	// In this scenario, you have a custom controller `MessageController`
	// with an `inbox` action.
	'/'	: 'MessageController.inbox'


	// Alternatively, you can use the more verbose syntax:
	'/': {
		controller	: 'MessageController',
		action		: 'inbox'
	}


	// If you decided to call your action `index` instead of `inbox`,
	// since the `index` action is the default, you can shortcut even further to:
	'/': 'MessageController'


	// Up until now, we haven't specified a specific HTTP method/verb
	// The routes above will apply to ALL verbs!
	// If you want to set up a route only for one in particular
	// (GET, POST, PUT, DELETE, etc.), just specify the verb before the path.
	// For example, if you have a `UserController` with a `signup` action,
	// and somewhere else, you're serving a signup form looks like: 
	//
	//		<form action="/signup">
	//			<input name="username" type="text"/>
	//			<input name="password" type="password"/>
	//			<input type="submit"/>
	//		</form>


	// You could define the following route:
	'post /signup'	: 'UserController.signup'


	// Finally, here's an example of how you would route all GET requests 
	// to the `/google` route to Google's website:
	'get /google'	: 'http://google.com'
	
	*/
};




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

module.exports[404] = function pageNotFound (req, res, defaultNotFoundBehavior) {
	
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

module.exports[500] = function serverErrorOccurred (errors, req, res, defaultErrorBehavior) {

	// Ensure that `errors` is a list
	var displayedErrors = (typeof errors !== 'object' || !errors.length ) ?
		[errors] :
		errors;

	// Ensure that each error is formatted correctly
	// Then log them
	for (var i in displayedErrors) {
		if (!(displayedErrors[i] instanceof Error)) {
			displayedErrors[i] = require('util').inspect(new Error(displayedErrors[i]));
			sails.log.error(displayedErrors[i]);
		} else {
      displayedErrors[i] = displayedErrors[i].stack;
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