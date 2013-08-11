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
		if (util.isArray(target)) {
			return bindArray(path, target, verb);
		}

		if (util.isObject(target) && !util.isFunction(target) && !util.isArray(target)) {
			
			if (util.isString(target.view)) {
				return bindView(path, target, verb);
			}
			
			if (!util.isUndefined(target.controller)) {
				return bindController(path, target, verb);
			}

		}

		if (util.isString(target)) {
			return bindString(path, target, verb);
			
		}

		// Inline target function
		if (util.isFunction(target)) {

			// Route to middleware function
			return bindFunction(path, target, verb);
		}


		sails.emit('route:typeUnknown', {
			path	: path,
			target	: target,
			verb	: verb
		});
		// If we make it here, the specified target property is invalid
		// No reason to crash the app in this case, so just ignore the bad route
		//logInvalidRouteError(path, target, verb);

	}



	function bindArray ( path, target, verb ) {
		util.each(target, function (fn) {
			bind(path, fn, verb);
		});
	}



	/**
	 * Controller/action syntax
	 * TODO: pull this logic into the controllers hook
	 */

	function bindController ( path, target, verb ) {

		// Normalize controller and action ids
		var controllerId = util.normalizeControllerId(target.controller);
		var actionId = util.isString(target.action) ? target.action.toLowerCase() : null;

		// Look up appropriate controller/action and make sure it exists
		var controller = sails.middleware.controllers[controllerId];

		// Fall back to matching view
		if (!controller) {
			controller = sails.middleware.views[controllerId];
		}

		// If a controller was specified but it doesn't match, warn the user
		if ( ! (controller && util.isDictionary(controller) && controller[actionId || 'index']) ) {

			sails.log.error(
				controllerId + '.' + (actionId || 'index'),
				':: Ignoring attempt to bind route (' + path + ') to unknown controller.action.'
			);
			return;
		}

		// If specified, lookup the `action` function, otherwise lookup index
		var subTarget = controller[actionId || 'index'];

		// Make sure the controller function (+/- policies, etc.) is usable
		if (util.isArray(subTarget)) {
			util.each(subTarget, function bindEachMiddlewareInSubTarget (fn) {
				_bind(path, controllerHandler(fn), verb);
			});
			return;
		}
		
		// Bind a controller function to the destination route
		_bind(path, controllerHandler(subTarget), verb);


		// Wrap up the controller middleware to supply access to
		// the original target when requests comes in
		function controllerHandler (originalFn) {

			if ( !util.isFunction(originalFn) ) {
				sails.log.error(controllerId + '.' + actionId + ' :: ' +
					'Ignoring invalid attempt to bind route to a non-function controller:', 
					originalFn, 'for path: ', path, verb ? ('and verb: ' + verb) : '');
				return;
			}
			
			// Bind intercepted middleware function to route
			return function wrapperFn (req, res, next) {
				
				// Set target metadata
				req.target = {
					controller: controllerId,
					action: actionId || 'index'
				};
				
				// Call actual controller
				originalFn(req, res, next);
			};
		}

		return;
	}



	/**
	 * view syntax
	 * TODO: pull this logic into the views hook
	 */

	function bindView ( path, target, verb ) {

		// Get view names
		var view = target.view.split('/')[0];
		var subview = target.view.split('/')[1] || 'index';

		// Look up appropriate view and make sure it exists
		var viewMiddleware = sails.middleware.views[view];
		if (util.isDictionary(viewMiddleware)) {
			viewMiddleware = viewMiddleware[subview];
		}

		// If a view was specified but it doesn't match, warn the user
		if ( !viewMiddleware ) {

			sails.log.error(
				'Ignoring attempt to bind route (' + 
				path + ') to unknown view: ' + target.view
			);
			return;
		}

		// Make sure the view function (+/- policies, etc.) is usable
		else if (util.isArray(viewMiddleware)) {
			util.each(viewMiddleware, function (fn) {
				_bind(path, viewHandler(fn), verb);
			});
			return;
		}
		
		// Bind a view function to the destination route
		else {
			_bind(path, viewHandler(subTarget), verb);
			return;
		}


		// Wrap up the view middleware to supply access to
		// the original target when requests comes in
		function viewHandler (originalFn) {

			if ( !util.isFunction(originalFn) ) {
				sails.log.error(
					'Ignoring invalid attempt to bind route to invalid target:', 
					originalFn, 'for path: ', path, verb ? ('and verb: ' + verb) : '');
				return;
			}
			
			// Bind intercepted middleware function to route
			return function wrapperFn (req, res, next) {
				
				// Set target metadata
				req.target = {
					view: target.view
				};
				
				// Call actual controller
				originalFn(req, res, next);
			};
		}
	}


	
	/**
	 * simple middleware function syntax
	 */

	function bindFunction ( path, fn, verb ) {
		_bind ( path, fn, verb );
	}




	function bindString ( path, target, verb ) {

		// Handle dot notation
		var parsedTarget = target.match(/^([^.]+)\.?([^.]*)?$/);
		
		// If target matches a controller (or, if views hook enabled, a view)
		// go ahead and assume that this is a dot notation route
		var controllerId = util.normalizeControllerId(parsedTarget[1]);
		var actionId = util.isString(parsedTarget[2]) ? parsedTarget[2].toLowerCase() : 'index';

		// TODO: pull this logic into the controllers hook
		if ( controllerId && (
			sails.middleware.controllers[controllerId] ||
			(sails.config.hooks.views.blueprints && sails.middleware.views[controllerId])
			)
		) {
			return bind(path, {
				controller: controllerId,
				action: actionId
			}, verb);
		}

		// Handle slash (view) notation
		// to build path to view middleware
		var pathToView = target.match(/^([^\/]+)\/([^\/]*)$/);
		if (pathToView) {
			// TODO: pull this logic into the views hook
			return bind(path, {
				view: pathToView
			}, verb);
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
			sails.emit('router:route', {
				req: req,
				res: res,
				next: next
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
		// sails.express.app[verb || 'all'](path, target);	
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
