module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
		pluralize = require('pluralize'),
		util = require('sails/lib/util'),
		Controller = {
			find: require('./controller.find.js')(sails),
			create: require('./controller.create.js')(sails),
			update: require('./controller.update.js')(sails),
			destroy: require('./controller.destroy.js')(sails)
		};

		

	/**
	 * Expose `Controller` hook definition
	 */

	return {

		defaults: {
			// Controller config
			controllers: {

				// (Note: global controller.blueprints config may be overridden on a per-controller basis
				//			by setting the 'blueprint' property in a controller)
				blueprints: {

					// Whether routes are automatically generated for controller actions
					actions: true,

					// e.g. '/:controller/find/:id'
					shortcuts: true,

					// e.g. 'get /:controller/:id?': 'foo.find'
					rest: true,

					// Optional mount path prefix for blueprint routes
					// e.g. '/api/v2'
					prefix: '',

					// If a blueprint REST route catches a request,
					// only match an `id` if it's an integer
					expectIntegerId: false, 

					// Enable JSONP callbacks on REST blueprints
					jsonp: false,

					// Pluralize controller names in routes
					pluralize: false
				}
			}
		},

		// Don't allow sails to lift until ready 
		// is explicitly set below
		ready: false,


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {
			var self = this;

			// Optional callback
			cb = util.optional(cb);


			// bind action routes
			// (auto-routing for controller blueprints)
			var bindActionRoutes_dependencies = [
				'router:after'
			];

			// bind crud routes
			var bindCRUDRoutes_dependencies = [
				'router:after',
				'hook:controllers:bound:actions'
			];


			// If policies hook is enabled, wait until policies are bound 
			// before binding action AND crud blueprint routes
			if (sails.hooks.policies) {
				bindActionRoutes_dependencies.push('hook:policies:bound');
				bindCRUDRoutes_dependencies.push('hook:policies:bound');
			}


			// Bind routes at the appropriate times
			waitForAll(bindActionRoutes_dependencies, self.bindActionRoutes);
			waitForAll(bindCRUDRoutes_dependencies, self.bindCRUDRoutes);

			// Grab middleware modules and trigger callback
			self.loadMiddleware(cb);

			// Register known route syntax
			sails.on('route:typeUnknown', function (route) {
				self._interpretRouteSyntax(route);
			});

		},

		/**
		 * "Teach" router to understand references to controllers.
		 */
		_interpretRouteSyntax: function (route) {
			var target = route.target,
				path = route.path,
				verb = route.verb,
				options = route.options;

			if (util.isObject(target) && !util.isFunction(target) && !util.isArray(target)) {
			
				// Support { controller: 'FooController' } notation
				if (!util.isUndefined(target.controller)) {
					return this.bindController(path, target, verb);
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
					return this.bindController (path, {
						controller: controllerId,
						action: actionId
					}, verb);
				}
			}

			// Ignore unknown route syntax
			// If it needs to be understood by another hook, the hook would have also received
			// the typeUnknown event, so we're done.
			return;

		},

		/**
		 * Bind route to a controller/action
		 */

		bindController: function ( path, target, verb ) {

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
			


			// If actionId not specified, inject middleware which will set req.target
			// to allow the action, shortcut, and crud blueprints to take effect
			// (if they are enabled)
				
			// TODO: Bind all blueprints to the destination route

			// TODO: Actually, move this logic to the controller hook-- 
			// which should listen to the 'route:typeUnknown' event and handle 
			// these sorts of routes as prefixed blueprint routes
			// e.g. '/bar': { controller: 'FooController' }
			// binds FooController to both /bar and /foo, with all relevant blueprints attached, 
			// e.g. `get /foo`, `post /foo`, `/foo/:action/:id?`, `/foo/create`, `/foo/update/:id?`, 
			// and all the rest!


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
		},


		/**
		 * Bind blueprint routes handle controller actions
		 */

		bindActionRoutes: function () {			

			// For every controller, bind all of its actions as routes
			_.each(sails.controllers, function (controller, controllerId) {
				if (!util.isDictionary(controller)) {
					return;
				}

				// Interlace app-global `config.controllers` with this controller's `_config`
				var controllerConfig = util.merge({}, 
					sails.config.controllers, 
					controller._config || {});

				// If the action routes are enabled, we must bind routes
				if (controllerConfig.blueprints.actions) {

					var controllerActions = _.functions(sails.controllers[controllerId]);

					// Determine route to bind to
					// Apply prefix config (but strip leading and trailing slash)
					var controllerRoute = controllerConfig.blueprints.pluralize ? pluralize(controllerId) : controllerId;
					_.each(controllerActions, function (actionId) {

						// Ensure case-insensitivity by lowercasing both the action name
						// and the route
						actionId = actionId.toLowerCase();

						// Bind index route
						if (actionId === 'index') {
							var indexRoute = controllerConfig.blueprints.prefix + '/' + controllerRoute;
							sails.router.bind(indexRoute, _serveBlueprint(controllerId, actionId));
						}

						// Apply controller and action to route expresion
						// (All HTTP verbs)

						// TODO:	check that :id? is !== create, update, or destroy 
						//			in route regexp to preserve proper shortcut behavior
						var appliedRoute = controllerConfig.blueprints.prefix + '/' + controllerRoute + '/' + actionId + '/:id?';
						sails.router.bind(appliedRoute, _serveBlueprint(controllerId, actionId));

					});

				}

			});

			sails.emit('hook:controllers:bound:actions');
		},


		/**
		 * Bind blueprint routes
		 * (serves CRUD middleware for controllers with matching models)
		 * Then fire the final :bound event
		 */
		
		bindCRUDRoutes: function ( ) {
			var self = this;

			// For every controller, bind all of its actions as routes
			_.each(sails.controllers, function (controller, controllerId) {

				if (!util.isDictionary(controller)) {
					return;
				}

				// Interlace app-global `config.controllers` with this controller's `_config`
				var controllerConfig = util.merge({}, 
					sails.config.controllers, 
					controller._config || {});

				// Determine route to bind to
				// Apply prefix config (but strip leading and trailing slash)
				var controllerRoute = controllerConfig.blueprints.pluralize ? pluralize(controllerId) : controllerId;

				// RESTful CRUD blueprints
				if ( controllerConfig.blueprints.rest ) {
					sails.log.verbose('Binding RESTful controller blueprints for ',controllerId);
					sails.router.bind('get ' + controllerConfig.blueprints.prefix + '/'+ controllerRoute + '/:id?', _serveBlueprint(controllerId, 'find'));
					sails.router.bind('post ' + controllerConfig.blueprints.prefix + '/'+ controllerRoute, _serveBlueprint(controllerId, 'create'));
					sails.router.bind('put ' + controllerConfig.blueprints.prefix + '/'+ controllerRoute + '/:id?', _serveBlueprint(controllerId, 'update'));
					sails.router.bind('delete ' + controllerConfig.blueprints.prefix + '/'+ controllerRoute + '/:id?', _serveBlueprint(controllerId, 'destroy'));
				}

				// Shortcut CRUD blueprints
				if ( controllerConfig.blueprints.shortcuts ) {
					sails.log.verbose('Binding shortcut controller blueprints for ',controllerId);
					sails.router.bind(controllerConfig.blueprints.prefix + '/'+ controllerRoute + '/find/:id?', _serveBlueprint(controllerId, 'find'));
					sails.router.bind(controllerConfig.blueprints.prefix + '/'+ controllerRoute + '/create', _serveBlueprint(controllerId, 'create'));
					sails.router.bind(controllerConfig.blueprints.prefix + '/'+ controllerRoute + '/update/:id?', _serveBlueprint(controllerId, 'update'));
					sails.router.bind(controllerConfig.blueprints.prefix + '/'+ controllerRoute + '/destroy/:id?', _serveBlueprint(controllerId, 'destroy'));
				}
			});

			sails.emit('hook:controllers:bound:crud');
			this.ready = true;
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
			sails.modules.optional({
				dirname: sails.config.paths.controllers,
				filter: /(.+)Controller\.(js|coffee)$/,
				markDirectories: true,
				replaceExpr: /Controller/
			}, function modulesLoaded (err, modules) {

				if (err) return cb(err);

				// Collapse nested controllers to one level
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
				// Flatten each value in the modules directory we got back from sails.modules.optional
				_.each(modules, function(controller, controllerId) {flattenController(controllerId, controller);});

				// Save freshly loaded modules in `sails.controllers`
				sails.controllers = controllers;

				// Get federated controllers where actions are specified each in their own file
				// var federatedControllers = sails.modules.optional({
				// 	dirname: sails.config.paths.controllers,
				// 	pathFilter: /(.+)\/(.+)\.(js|coffee)$/
				// });
				// sails.controllers = _.extend(sails.controllers, federatedControllers);

				// Register controllers
				_.each(sails.controllers, function(controller, controllerId) {

					// Override whatever was here before
					if ( !util.isDictionary(self.middleware[controllerId]) ) {
						self.middleware[controllerId] = {};
					}

					// Mix in middleware from blueprints
					self.middleware[controllerId].find = Controller.find;
					self.middleware[controllerId].create = Controller.create;
					self.middleware[controllerId].update = Controller.update;
					self.middleware[controllerId].destroy = Controller.destroy;

					// Mix in middleware from user controller
					_.each(controller, function(action, actionId) {

						// action ids are case insensitive
						actionId = actionId.toLowerCase();


						// If the action is set to `false`, explicitly disable it
						if (action === false) {
							delete self.middleware[controllerId][actionId];
							return;
						}

						// Ignore special properties
						// TODO: hide these in the prototype (moduleloader)
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
	 * Returns a middleware chain that remembers the target and rns a blueprint
	 * (This concatenation approach is crucial to allow policies to be bound)
	 */

	function _serveBlueprint (controllerId, actionId) {
		return [function wrapperFn (req, res, next) {

			// Track the controller/action target
			// (grab from the path params)
			req.target = {
				controller: controllerId,
				action: actionId
			};

			next();

		}].concat(sails.middleware.controllers[controllerId][actionId]);
	}



	/**
	 * Wait until dependency conditions have been satisfied
	 *
	 * @param {Object} events - list of sails.on() event names to wait for
	 * @param {Function} cb
	 *
	 * @api private
	 */

	function waitForAll (events, cb) {
		// sails.log.verbose('Waiting to lift guard until all these events have fired ::', events);

		var dependencies = [];
		_.each(events, function (event) {
			dependencies.push(function waitFor (cb) {
				return sails.on(event, cb);
			});					
		});
		
		async.auto(dependencies, function (err) {
			sails.log.verbose('Lifting guard-- all conditions satisfied.');
			return cb(err);
		});
	}

};