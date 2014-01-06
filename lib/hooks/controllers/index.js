/**
 * Module dependencies.
 */

var _ = require('lodash'),
	util = require('sails-util');


/**
 * Expose `controllers` hook definition
 */
module.exports = function(sails) {
	return {

		defaults: {},

		// Don't allow sails to lift until ready 
		// is explicitly set below
		ready: false,


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {

			// Register known route syntax
			sails.on('route:typeUnknown', interpretRouteSyntax);

			// Grab middleware modules and trigger callback
			this.loadMiddleware(cb);
		},




		/**
		 * Wipe everything and (re)load middleware from controllers
		 *
		 * @api private
		 */

		loadMiddleware: function(cb) {
			var self = this;

			sails.log.verbose('Building middleware registry...');

			// Load app controllers
			sails.log.verbose('Loading controller modules from app...');
			sails.modules.loadControllers(function modulesLoaded (err, modules) {
				if (err) return cb(err);

				// Collapse nested (federated) controllers to one level
				var controllers = {};				
				function flattenController(name, config) {
					// If this object isn't a directory containing other controllers,
					// add it to the flattened controllers dictionary
					if (!config.isDirectory) {
						controllers[name] = config;
					} 
					// Otherwise recursively flatten the directory structure
					else {
						_.each(config, function(val, key) {
							if (util.isDictionary(val)) {
								flattenController(name+'/'+key.toLowerCase(), val);
							}
						});
					}
				}
				// Flatten each value in the modules directory we got back from sails.modules
				_.each(modules, function(controller, controllerId) {flattenController(controllerId, controller);});

				// Save freshly loaded modules in `sails.controllers`
				sails.controllers = controllers;

				// Register controllers
				_.each(sails.controllers, function(controller, controllerId) {

					// Override whatever was here before
					if ( !util.isDictionary(self.middleware[controllerId]) ) {
						self.middleware[controllerId] = {};
					}

					// Mix in middleware from blueprints
					// ----removed----
					// 
					// TODO: MAKE SURE THIS IS OK
					// self.middleware[controllerId].find = Controller.find;
					// self.middleware[controllerId].create = Controller.create;
					// self.middleware[controllerId].update = Controller.update;
					// self.middleware[controllerId].destroy = Controller.destroy;
					// 
					// -----/removed------


					// Register this controller's actions
					_.each(controller, function(action, actionId) {

						// action ids are case insensitive
						actionId = actionId.toLowerCase();


						// If the action is set to `false`, explicitly disable it
						if (action === false) {
							delete hook.middleware[controllerId][actionId];
							return;
						}

						// Ignore special properties
						// 
						// TODO:
						// Some of these properties are injected by `moduleloader`
						// They should be hidden in the prototype or omitted instead.
						if (util.isString(action) || util.isBoolean(action)) {
							return;
						}

						// Otherwise mix it in (this will override CRUD blueprints from above)
						self.middleware[controllerId][actionId] = action;
					});
				});

				// Done!
				return cb();
			});
		}
	};



	/**
	 * interpretRouteSyntax
	 * 
	 * "Teach" router to understand references to controllers.
	 * 
	 * @param  {[type]} route [description]
	 * @return {[type]}       [description]
	 * @api private
	 */
	function interpretRouteSyntax (route) {
		var target = route.target,
			path = route.path,
			verb = route.verb,
			options = route.options;

		if (util.isObject(target) && !util.isFunction(target) && !util.isArray(target)) {
		
			// Support { controller: 'FooController' } notation
			if (!util.isUndefined(target.controller)) {
				return bindController(path, target, verb);
			}

			// Support resourceful sub-mappings for verbless routes
			// e.g. '/someRoute': { post: 'FooController.bar', get: '...', /* ... */ }
			// If verb was manually specified in route (e.g. `get /someRoute`), ignore the sub-mappings
			if ( !options.detectedVerb ) {
				if ( target.get ) { sails.router.bind (path, target['get'],'get'); }
				if ( target.post ) { sails.router.bind (path, target['post'],'post'); }
				if ( target.put ) { sails.router.bind (path, target['put'],'put'); }
				if ( target['delete'] ) { sails.router.bind (path, target['delete'],'delete'); }
			}
		}

		// Support string ('FooController.bar') notation
		if (util.isString(target)) {

			// Handle dot notation
			var parsedTarget = target.match(/^([^.]+)\.?([^.]*)?$/);
			
			// If target matches a controller (or, if views hook enabled, a view)
			// go ahead and assume that this is a dot notation route
			var controllerId = util.normalizeControllerId(parsedTarget[1]);
			var actionId = util.isString(parsedTarget[2]) ? parsedTarget[2].toLowerCase() : 'index';

			// If this is a known controller, bind it
			if ( controllerId && (
				sails.middleware.controllers[controllerId] ||
				(sails.config.hooks.views.blueprints && sails.middleware.views[controllerId])
				)
			) {
				return bindController (path, {
					controller: controllerId,
					action: actionId
				}, verb);
			}
		}

		// Ignore unknown route syntax
		// If it needs to be understood by another hook, the hook would have also received
		// the typeUnknown event, so we're done.
		return;
	}



	/**
	 * Bind route to a controller/action.
	 * 
	 * @param  {[type]} path   [description]
	 * @param  {[type]} target [description]
	 * @param  {[type]} verb   [description]
	 * @return {[type]}        [description]
	 * @api private
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

		// If a controller and/or action was specified, 
		// but it's not a match, warn the user
		if ( ! ( controller && util.isDictionary(controller) )) {
			sails.log.error(
				controllerId,
				':: Ignoring attempt to bind route (' + path + ') to unknown controller.'
			);
			return;
		}
		if ( actionId && !controller[actionId] ) {
			sails.log.error(
				controllerId + '.' + (actionId || 'index'),
				':: Ignoring attempt to bind route (' + path + ') to unknown controller.action.'
			);
			return;
		}


		// If unspecified, default actionId to 'index'
		actionId = actionId || 'index';

		// Bind the action subtarget
		var subTarget = controller[actionId];
		if (util.isArray(subTarget)) {
			util.each(subTarget, function bindEachMiddlewareInSubTarget (fn) {
				sails.router.bind(path, controllerHandler(fn), verb, target);
			});
			return;
		}
		
		// Bind a controller function to the destination route
		sails.router.bind(path, controllerHandler(subTarget), verb, target);


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

};