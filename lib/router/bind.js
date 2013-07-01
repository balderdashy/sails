module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */


	var _		= require( 'lodash' ),
		util	= require( '../util' );



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
	 * @api private
	 */

	function bind ( path, target, verb ) {

		// If trying to bind '*', that's probably not what was intended, so fix it up
		path = path === '*' ? '/*' : path;

		// If path has an HTTP verb, parse it out
		var detectedVerb = util.detectVerb(path);
		path = detectedVerb.original;

		// Preserve the explicit verb argument if it was specified
		if (!verb) {
			verb = detectedVerb.verb;
		}	
		

		// Handle target chain syntax
		if (_.isArray(target)) {
			return bindArray(path, target, verb);
		}

		if (_.isObject(target) && !_.isFunction(target) && !_.isArray(target)) {
			
			if (_.isUndefined(target.middleware)) {
				return bindController(path, target, verb);
			}

			return bindMiddleware(path, target, verb);
		}

		if (_.isString(target)) {
			return bindString(path, target, verb);
			
		}

		// Inline target function
		if (_.isFunction(target)) {

			// Route to middleware function
			return bindFunction(path, target, verb);
		}


		// If we make it here, the specified target property is invalid
		// No reason to crash the app in this case, so just ignore the bad route
		logInvalidRouteError(path, target, verb);

	}



	function bindArray ( path, target, verb ) {
		_.each(target, function (fn) {
			bind(path, fn, verb);
		});
	}



	/**
	 * controller/action syntax
	 * TODO: pull this logic into the controllers hook
	 */

	function bindController ( path, target, verb ) {

		var targetFn;

		// Look up appropriate controller/action and make sure it exists
		var controller = sails.middleware.controllers[target.controller];
		if (controller && _.isObject(controller) && controller[target.action || 'index']) {

			// If specified, lookup the `action` function, otherwise lookup index
			targetFn = controller[target.action || 'index'];
		}

		// If a controller was specified but it doesn't match, warn the user
		else {
			sails.log.error(
				'Ignoring attempt to bind route (' + path + ') to unknown controller.action (' + 
				target.controller + '.' + (target.action || 'index') + ')...');
			return;
		}

		// Bind intercepted middleware function to route
		_bind(path, function wrapperFn (req, res, next) {
			
			// Set target metadata
			req.target = _.clone(target);
		}, verb);

		return;
	}


	/**
	 * middleware def syntax
	 */

	function bindMiddleware ( path, target, verb ) {

		if (_.isUndefined(target.id)) {
			target.id = 'middleware_' + (sails.middlewareAI ? ++sails.middlewareAI : 1);
		}

		// Get the middleware function
		var targetFn = parseMiddleware(target);

		// Bind the target action if it exists
		if (targetFn) {

			// Wrap the middleware function in a method that creates the branch functions
			var wrapperFn = function wrapperFn (req, res, next) {
				
				// Set target metadata
				req.target = _.clone(target);

				// Set route config
				req._route = _.clone(sails.config.routes[path]);


				next.branch = {};
				_.each(_.keys(target.exits), function(exit) {

					next.branch[exit] = function() {
						req.url = target.id+'_'+exit;
						next('route');
					};
				});

				targetFn(req, res, next);

			};


			// Add another callback to the route so that "next()" will call the success branch (if it exists)
			// or else the next route matching the original url
			var callbacks = [wrapperFn];
			if (target.exits && target.exits.success) {
				callbacks.push(function(req, res, next){
						req.url = target.id+'_success';
						sails.log.verbose('branching to '+req.url);
						next('route');
					}
				);
			} else {
				callbacks.push(function(req, res, next){req.url = req.originalUrl; next('route');});
			}

			// Bind the callbacks to the path
			bindArray(path, callbacks, verb);

			// Create unique paths for each exit and bind them.  Since the paths don't have a '/' in front,
			// the aren't reachable by the browser.
			_.each(_.keys(target.exits), function(exit) {				

				var exitPath = target.id+'_'+exit;
				bind(exitPath, target.exits[exit], null);

			});

			return;
		}
	}



	
	/**
	 * simple middleware function syntax
	 */

	function bindFunction ( path, fn, verb ) {

		// Take best guess at req.controller, req.entity, and req.action routing flags
		_bind ( path, fn, verb );
	}




	function bindString ( path, target, verb ) {

		// Handle dot notation
		var parsedTarget = target.match(/^([^.]+)\.?([^.]*)?$/);
		
		// If target matches a controller in the middleware registry
		// go ahead and assume that this is a dot notation route
		// TODO: pull this logic into the controllers hook
		if (parsedTarget[1] && sails.middleware.controllers[parsedTarget[1]]) {

			bind(path, {
				controller: parsedTarget[1],
				action: parsedTarget[2]
			}, verb);

			return;
		}

		// Otherwise if the target cannot be parsed as dot notation,
		// redirect requests to the specified string (which hopefully is a URL!)
		_bind (path, function (req, res) {
			sails.log.verbose('Redirecting request (`' + path + '`) to `' + target + '`...');
			res.redirect(target);
		}, verb);

		return;
	}


	/**
	 * Attach middleware function to route
	 *
	 * @api prvate
	 */

	function _bind ( path, fn, verb ) {

		sails.log('Binding :: ', verb || '', path);

		// Ensure that fn is a function
		if ( !_.isFunction(fn) ) {
			sails.log.error('Ignoring invalid attempt to bind route to a non-function:', fn, 'for path: ', path, 'and verb: ', verb);
			return;
		}

		// If verb is not specified, the route should be cloned to all verbs
		sails.router.app[verb || 'all'](path, fn);

		// Emit an event to make hooks aware that a route was bound
		// (this allows hooks to handle routes directly if they want to)
		sails.emit('router:bind', {
			path	: path,
			target	: _.clone(fn),
			verb	: verb
		});

		// e.g. with Express, the handler for this event looks like:
		// sails.express.app[verb || 'all'](path, target);	
	}


	/**
	 * Set req.controller, req.entity, and req.action routing flags
	 * @param {Function} fn
	 * @param {Object|undefined} routeTarget
	 * @param {String|undefined} path
	 *
	 * @api private
	 */

	function setRouteFlags (fn, routeTarget, path) {

		return function applyRouteFlags (req, res, next) {
		
			// Take a guess at target if necessary
			if (!routeTarget) {
				routeTarget = util.parsePath(req.path);
			}
			
			// Set routing metadata
			console.log('****');
			console.log('Binding '+path+' to:');
			console.log('routeTarget', routeTarget);
			console.log('req.target', req.target);
			
			req.target = _.clone(routeTarget);
			req.controller = routeTarget.controller;
			req.action = routeTarget.action || 'index';

			console.log('req.target[1]', req.target);

			// Set route config if this route originated from a statically configured route
			if (path) {
				req._route = _.clone(sails.config.routes[path]);
			}

			// For backwards compatibility:
			req.entity = routeTarget.controller;

			// Call target
			fn(req, res, next);
		};
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
		// (but stringify it if necessary so it's easier to read when we fire off an error log)
		if (_.isObject(target)) {
			try {
				target = JSON.stringify(target);
			}
			catch (e) {}
		}

		sails.log.error('Ignoring invalid attempt to bind route (' + path + ') to: ' + target, 'with verb:',verb);
	}

};
