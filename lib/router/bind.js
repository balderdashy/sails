module.exports = function (sails) {


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
		if (_.isObject(target) && !_.isFunction(target) && !_.isArray(target) && _.isUndefined(target.middleware)) {

			var controller = sails.middleware[target.controller];
			if (controller) {

				// If specified, lookup the `action` function, otherwise lookup index
				targetFn = controller[target.action || 'index'];
			}

			// If a controller was specified but it doesn't match, warn the user
			else {
				log.error('Cannot bind route (' + path + ') to unknown target (' + target + ')...');
				return;
			}

			// Set req.* routing flags
			this.mixinRouteData(path, target, verb);

			// Bind intercepted middleware function to route
			this.app[verb || 'all'](path, targetFn);

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

				// Set req.* routing flags
				this.mixinRouteData(path, target, verb);

				// Wrap the middleware function in a method that creates the branch functions
				var wrapperFn = function(req, res, next) {

					next.branch = {};
					_.each(_.keys(target.exits), function(exit) {

						next.branch[exit] = function() {
							req.url = target.id+'_'+exit;
							console.log('branching to '+req.url);
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
				this.app[verb || 'all'](path, callbacks);

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
			if (parsedTarget[1] && sails.middleware.controllers[parsedTarget[1]]) {

				return this.bind(path, {
					controller: parsedTarget[1],
					action: parsedTarget[2]
				}, verb);
			}

			// Otherwise if the target cannot be parsed as dot notation,
			// redirect requests to the specified string (which hopefully is a URL!)
			this.app[verb || 'all'](path, function (req, res) {
				log.verbose('Redirecting request (`' + path + '`) to `' + target + '`...');
				res.redirect(target);
			});

			return;
		}

		// Inline target function
		if (_.isFunction(target)) {

			// Take best guess at req.* routing flags
			this.mixinRouteData(path, util.parsePath(path), verb);

			// Route to middleware function
			this.app[verb || 'all'](path, target);
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

	function parseMiddleware(target) {

		// Right now we just return the "middleware" property of the route config, expecting it to be a function.
		// In the future parseMiddleware will handle string values for "middleware", as well as config options 
		// such as inputs and outputs.
		return target.middleware;

	}	

};
