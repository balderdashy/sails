module.exports = function (sails) {

	// NOTE:
	////////////////////////////////////////////////////////////////////////////////////
	// Implement next() (just look at req.url)
	// next('route') is like a break (go down to the next actual path-based route)
	// next() is like a continue (continue down the chain of the current path)
	////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Module dependencies.
	 */


	var _		= require( 'lodash' ),
		util	= require( '../util' );


	// Var used to make simple middleware uids when they aren't provided in the config
	var middlewareId = 0;


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

		var log = this.log;

		// If path has an HTTP verb, parse it out
		var detectedVerb = util.detectVerb(path);
		path = detectedVerb.original;

		// Preserve the explicit verb argument if it was specified
		if (!verb) {
			verb = detectedVerb.verb;
		}	
		

		// Handle target chain syntax
		if (_.isArray(target)) {
			_.each(target, function (fn) {
				this.bind(path, fn, verb);
			}, this);

			return;
		}

		// Object syntax (controller/action)
		// TODO: pull this logic into the controllers hook
		if (_.isObject(target) && !_.isFunction(target) && !_.isArray(target) && _.isUndefined(target.middleware)) {

			var controller = sails.middleware.controllers[target.controller];
			
			if (controller) {

				// If specified, lookup the `action` function, otherwise lookup index
				targetFn = controller[target.action || 'index'];
			}

			// If a controller was specified but it doesn't match, warn the user
			else {
				log.error('Cannot bind route (' + path + ') to unknown target (' + target + ')...');
				return;
			}

			// Set req.controller, req.entity, and req.action routing flags
			bindControllerMetadata(path, target, verb);

			// Bind intercepted middleware function to route
			sails.express.app[verb || 'all'](path, targetFn);

			return;
		}

		// Object syntax (middleware)
		if (_.isObject(target) && !_.isFunction(target) && !_.isArray(target) && !_.isUndefined(target.middleware)) {		
		
			if (_.isUndefined(target.id)) {
				target.id = 'middleware_'+(middlewareId++);				
			}

			// Get the middleware function
			var targetFn = parseMiddleware(target);

			// Bind the target action if it exists
			if (targetFn) {

				// Set req.controller, req.entity, and req.action routing flags
				bindControllerMetadata(path, target, verb);

				// Wrap the middleware function in a method that creates the branch functions
				var wrapperFn = function(req, res, next) {

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
							console.log('branching to '+req.url);
							next('route');
						}
					);
				} else {
					callbacks.push(function(req, res, next){req.url = req.originalUrl; next('route');});
				}

				// Bind the callbacks to the path
				console.log("binding "+path);
				sails.express.app[verb || 'all'](path, callbacks);

				// Create unique paths for each exit and bind them.  Since the paths don't have a '/' in front,
				// the aren't reachable by the browser.
				_.each(_.keys(target.exits), function(exit) {				

					var exitPath = target.id+'_'+exit;
					this.bind(exitPath, target.exits[exit], 'all');

				}, this);

				return;
			}
		}


		
		if (_.isString(target)) {

			// Handle dot notation
			var parsedTarget = target.match(/^([^.]+)\.?([^.]*)?$/);
			
			// If target matches a controller in the middleware registry
			// go ahead and assume that this is a dot notation route
			// TODO: pull this logic into the controllers hook
			if (parsedTarget[1] && sails.middleware.controllers[parsedTarget[1]]) {

				return this.bind(path, {
					controller: parsedTarget[1],
					action: parsedTarget[2]
				}, verb);
			}

			// Otherwise if the target cannot be parsed as dot notation,
			// redirect requests to the specified string (which hopefully is a URL!)
			sails.express.app[verb || 'all'](path, function (req, res) {
				log.verbose('Redirecting request (`' + path + '`) to `' + target + '`...');
				res.redirect(target);
			});

			return;
		}

		// Inline target function
		if (_.isFunction(target)) {

			// Take best guess at req.controller, req.entity, and req.action routing flags
			bindControllerMetadata(path, util.parsePath(path), verb);

			// Route to middleware function
			sails.express.app[verb || 'all'](path, target);
			return;
		}

		// If we make it here, the specified target property is invalid
		// No reason to crash the app in this case, so just ignore the bad route

		// (but stringify it if necessary so it's easier to read when we fire off an error log)
		if (_.isObject(target)) {
			try {
				target = JSON.stringify(target);
			}
			catch (e) {}
		}

		log.error('Ignoring invalid attempt to bind route (' + path + ') to: ' + target);
	}



	function bindArray ( path, target, verb ) {

	}



	function bindController ( path, target, verb ) {

	}



	function bindMiddleware ( path, target, verb ) {

	}



	/**
	 * Attach middleware function to route
	 */

	function bindFunction ( path, target, verb ) {

		sails.express.app[verb || 'all'](path, target);
	}



	function bindString ( path, target, verb ) {

	}



	/**
	 * Attach middleware to mixin route metadata to req object
	 *
	 * TODO: pull this logic into the controllers hook
	 *
	 * @param {String|RegExp} path
	 * @param {String|Object|Array|Function} bindTo
	 * @param {String} verb
	 * @api private
	 */

	function bindControllerMetadata ( path, target, verb ) {

		bindFunction(path, function (req, res, next) {
			
			// Set routing metadata
			req.target = target;
			req.controller = target.controller;
			req.action = target.action || 'index';

			// Set route config
			req._route = sails.config.routes[path];

			// For backwards compatibility:
			req.entity = target.controller;
			next();

		}, verb);
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

};
