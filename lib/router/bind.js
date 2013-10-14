module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */


	var util	= require( '../util' );



	/**
	 * Expose `bind` method.
	 */

	return bind;



	/**
	 * Bind new route(s)
	 *
	 * @param {String|RegExp} path
	 * @param {String|Object|Array|Function} target
	 * @param {String} verb (optional)
	 * @param {Object} options (optional)
	 * @api private
	 */

	function bind ( path, target, verb, options ) {
		options = options || {};

		// If trying to bind '*', that's probably not what was intended, so fix it up
		path = path === '*' ? '/*' : path;

		// If path has an HTTP verb, parse it out
		// and remove the verb (`get`, `post`, or whatever) from the path
		var detectedVerb = util.detectVerb(path);
		options.detectedVerb = detectedVerb;
		path = detectedVerb.original;

		// Preserve the explicit verb argument if it was specified
		if (!verb) {
			verb = detectedVerb.verb;
		}	

		// Handle target chain syntax
		if (util.isArray(target)) {
			return bindArray(path, target, verb, options);
		}

		// Inline target function
		if (util.isFunction(target)) {

			// Route to middleware function
			return bindFunction(path, target, verb, options);
		}


		// Handle strings beginning with http: or / as redirects
		if (util.isString(target) && target.match(/^(https?:|\/)/)) {
			return bindRedirect(path, target, verb);
		}


		// If we make it here, the specified target property is invalid
		// No reason to crash the app in this case, so emit an event informing any listeners 
		// that an unknown route was encountered (then hooks can listen to this event and add functionality to sails)
		sails.emit('route:typeUnknown', {
			path	: path,
			target	: target,
			verb	: verb,
			options	: options
		});

	}


	function bindRedirect ( path, redirectTo, verb, options ) {
		// Requests will be redirected to the specified string
		// (which hopefully is a URL or redirectable path!)
		sails.router.bind (path, function (req, res) {
			sails.log.verbose('Redirecting request (`' + path + '`) to `' + redirectTo + '`...');
			res.redirect(redirectTo);
		}, verb, options);
	}


	function bindArray ( path, target, verb, options ) {
		util.each(target, function (fn) {
			bind(path, fn, verb, options);
		});
	}


	
	/**
	 * simple middleware function syntax
	 */

	function bindFunction ( path, fn, verb, options ) {
		_bind ( path, fn, verb, options );
	}


	/**
	 * Attach middleware function to route
	 *
	 * @api prvate
	 */

	function _bind ( path, fn, verb, options ) {

		// Make sure (optional) options is a valid {}
		options = util.isPlainObject(options) ? options : {};

		sails.log.verbose('Binding route :: ', verb || '', path);

		// Ensure that fn is a function
		if ( !util.isFunction(fn) ) {
			sails.log.error(
				(verb ? verb + ' ' : ''),
				path,
				':: Ignoring invalid attempt to bind route to a non-function:',
				fn
			);
			return;
		}

		// Middleware event
		// Parameter augmentations must be made here, since they occur 
		// on a per-middleware, not per-route, basis
		var enhancedFn = function (req,res,next) {
			
			// This event can be tapped into to take control of logic
			// that should be run before each middleware
			// (does not block-- so only use synchronous logic!)
			sails.emit('router:route', {
				req: req,
				res: res,
				next: next,
				options: options
			});

			// Trigger original middleware function
			fn(req, res, next);
		};

		// If verb is not specified, the route should be cloned to all verbs
		sails.router._app[verb || 'all'](path, enhancedFn);

		// Emit an event to make hooks aware that a route was bound
		// (this allows hooks to handle routes directly if they want to)
		sails.emit('router:bind', {
			path	: path,
			target	: util.clone(enhancedFn),
			verb	: verb
		});

		// e.g. with Express, the handler for this event looks like:
		// sails.hooks.http.app[verb || 'all'](path, target);	
	}



	/**
	 * Right now we just return the "middleware" property of the route config, expecting it to be a function.
	 * In the future parseMiddleware will handle string values for "middleware", as well as config options 
	 * such as inputs and outputs.
	 *
	 * @api private
	 */

	function parseMiddleware(target) {
		return target.middleware;
	}


	function logInvalidRouteError (path, target, verb) {

		sails.log.error(
			(verb ? verb + ' ' : ''),
			path,
			':: Ignoring invalid attempt to bind route to non-function:',
			util.inspect(target)
		);
	}

};
