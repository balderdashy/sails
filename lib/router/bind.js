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

		// Object syntax (controller/action or middleware)
		if (_.isObject(target) && !_.isFunction(target) && !_.isArray(target)) {

			var targetFn;

			// If middleware is set, don't look for controller/action
			if (target.middleware) {
				targetFn = target.middleware;
			}

			// Use `controller` property to get the controller from the middleware cache
			else {
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
			}
			

			// Bind the target action if it exists
			if (targetFn) {

				// Set req.* routing flags
				this.mixinRouteData(path, target, verb);

				// Tap into middleware target directly
				var injection = function (req,res,next) {
					
					req.exits = _.clone(target.exits);
					req.inputs = _.clone(target.inputs);

					// ... huh
					// next.error = next.pass(1);
					// next.success = next.pass(2);

					// next.pass = function(i) {
					// 	return function() {
					// 		pass(i);
					// 	}
					// };

					return targetFn(req,res,next);
				};

				// Bind intercepted middleware function to route
				this.app[verb || 'all'](path, injection);

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

};
