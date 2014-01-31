/**
 * Module dependencies.
 */
var util	= require( 'sails-util')
	, _ = require('lodash');



module.exports = function (sails) {


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

	function bind ( /* path, target, verb, options */ ) {
		var args = sanitize.apply(this,
			Array.prototype.slice.call(arguments));
		var path	= args.path,
			target	= args.target,
			verb	= args.verb,
			options	= args.options;


		// Bind a list of multiple functions in order
		if (util.isArray(target)) {
			return bindArray(path, target, verb, options);
		}
		// Handle string redirects
		// (to either public-facing URLs or internal routes)
		if (util.isString(target) && target.match(/^(https?:|\/)/)) {
			return bindRedirect(path, target, verb, options);
		}

		// Bind a middleware function directly
		if (util.isFunction(target)) {
			return bindFunction(path, target, verb, options);
		}


		// If we make it here, the router doesn't know how to parse the target.
		// 
		// This doesn't mean that it's necessarily invalid though--
		// so we'll emit an event informing any listeners that an unrecognized route
		// target was encountered.  Then hooks can listen to this event and act 
		// accordingly.  This makes it easier to add functionality to Sails.
		sails.emit('route:typeUnknown', {
			path	: path,
			target	: target,
			verb	: verb,
			options	: options
		});

		// TODO: track emissions of "typeUnknown" to avoid logic errors that result in circular routes
		// (part of the effort to make a more friendly environment for custom hook developers)
	}




	/**
	 * Requests will be redirected to the specified string
	 * (which should be a URL or redirectable path.)
	 * 
	 * @api private
	 */
	function bindRedirect ( path, redirectTo, verb, options ) {
		sails.router.bind (path, function (req, res) {
			sails.log.verbose('Redirecting request (`' + path + '`) to `' + redirectTo + '`...');
			res.redirect(redirectTo);
		}, verb, options);
	}


	/**
	 * Recursively bind an array of targets in order
	 *
	 * TODO: Use a counter to prevent indefinite loops--
	 *		 only possible if a bad route is bound,
	 *		 but would still potentially be helpful.
	 *
	 * @api private
	 */
	function bindArray ( path, target, verb, options ) {
		util.each(target, function (fn) {
			bind(path, fn, verb, options);
		});
	}



	/**
	 * Attach middleware function to route.
	 *
	 * @api prvate
	 */
	function bindFunction ( path, fn, verb, options ) {

		// Make sure (optional) options is a valid plain object ({})
		options = util.isPlainObject(options) ? options : {};
		sails.log.silly('Binding route :: ', verb || '', path);


		/**
		 * `router:route`
		 *
		 * Create a closure that emits the `router:route` event each time the route is hit
		 * before actually triggering the target function.
		 * 
		 * NOTE: Modifications to route parameters augmentations must be made here,
		 * since route parameters can change.
		 *
		 */
		var enhancedFn = function middlewareWrapper (req,res,next) {
			
			// Set req.options
			req.options = _.merge(req.options || {}, options);

			// This event can be tapped into to take control of logic
			// that should be run before each middleware function
			sails.emit('router:route', {
				req: req,
				res: res,
				next: next,
				options: options
			});

			// Trigger original middleware function
			fn(req, res, next);
		};

		// If verb is not specified, `all` should be used.
		// (this will route all verbs to the specified function)
		var targetVerb = verb || 'all';
		sails.router._slave[targetVerb](path, enhancedFn);

		// Emit an event to make hooks aware that a route was bound
		// This allows hooks to handle routes directly if they want to-
		// e.g. with Express, the handler for this event looks like:
		// sails.hooks.http.app[verb || 'all'](path, target);	
		sails.emit('router:bind', {
			path	: path,
			target	: util.clone(enhancedFn),
			verb	: verb
		});
	}


	/**
	 * Sanitize the arguments to `sails.router.bind()`
	 *
	 * @returns {Object} sanitized arguments
	 * @api private
	 */
	function sanitize ( path, target, verb, options ) {
		options = options || {};

		// If trying to bind '*', that's probably not what was intended, so fix it up
		path = path === '*' ? '/*' : path;

		// If route has an HTTP verb (e.g. `get /foo/bar`, `put /bar/foo`, etc.) parse it out,
		var detectedVerb = util.detectVerb(path);
		// then prune it from the path
		path = detectedVerb.original;
		// Keep track of parsed verb so we know if it was specified later
		options.detectedVerb = detectedVerb;

		// If a verb override was not specified, 
		// use the detected verb from the string route
		if (!verb) {
			verb = detectedVerb.verb;
		}

		return {
			path: path,
			target: target,
			verb: verb,
			options: options
		};
	}

};
