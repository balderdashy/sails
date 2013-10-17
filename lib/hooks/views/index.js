module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */


	var util			= require('sails/lib/util'),
		async			= require('async'),
		fs				= require('fs'),
		path			= require('path'),
		ejsLayoutEngine	= require('ejs-locals'),
		consolidate		= require('./consolidate');


	/**
	 * Expose protected access to _addResViewMethod middleware
	 *
	 * Used as a helper to bootstrap the res.view() method if core middleware fails 
	 * and tries to run the 500 handler
	 */

	sails._mixinResView = _addResViewMethod;


	/**
	 * Expose Hook definition
	 */

	return {

		// Implicit defaults
		defaults: {
			views: {

				// Engine for views (can be ejs, haml, etc.)
				engine: 'ejs',

				// Layout is on by default, in the top level of the view directory
				// true === use default
				// false === don't use a layout
				// string === path to layout
				layout: true
			}
		},


		/**
		 * Standard responsibilities of `initialize` are to load middleware methods
		 * and listen for events to know when to bind any special routes.
		 *
		 * @api private
		 */

		initialize: function (cb) {
			var self = this;


			if ( !sails.config.hooks.http ) {
				return cb('HTTP hook disabled-- but views hook does not work w/o an http server!');
			}
				
			// Add res.view() method to compatible middleware
			sails.on('router:before', function () {
				sails.router.bind('/*', _addResViewMethod);
			});

			// Register known route syntax
			sails.on('route:typeUnknown', function (event) {
				self._interpretRouteSyntax(event);
			});

			// Intercept each middleware and apply route options
			sails.on('router:route', function (event) {
				self._interceptRoute(event);
			});

			// Declare hook loaded when ejs layouts have been applied,
			// views have been inventoried, and view-serving middleware has been prepared
			async.auto({

				ejsLayouts: self.implementEjsLayouts,

				// Detect and prepare auto-route middleware for view files
				globViews: self.detectAndPrepareViews

			}, cb);
		},


		

		/**
		 * Validate configuration
		 */
		configure: function () {

			if (sails.config.viewEngine) {
				log.warn('The `config.viewEngine` config has been deprecated in favor of `config.views.engine`.');
				log.warn('It has been automatically migrated, but you\'ll continue to see this warning until you change your configuration files.');
				sails.config.views.engine = sails.config.viewEngine;
			}

			// Normalize view engine config
			if (typeof sails.config.views.engine === 'string') {
				var viewExt = sails.config.views.engine;
				sails.config.views.engine = {
					ext: viewExt
				};
			}

			// Ensure valid config
			if (! (sails.config.views.engine && sails.config.views.engine.ext) ) {
				log.error('Invalid view engine configuration. `config.views.engine` should');
				log.error('be set to either a `string` or an `object` with the following properties:');
				log.error('    {');
				log.error('        ext: <string>,   // the file extension');
				log.error('        fn: <function>   // the template engine render function');
				log.error('    }');
				log.error('For example: {ext:"html", fn: require("consolidate").swig}');
				log.error('For details: http://expressjs.com/api.html#app.engine');
				throw new Error('Invalid view engine configuration.');
			}

			// Try to load view module if a function wasn't specified directly
			if ( !sails.config.views.engine.fn ) {
				var viewEngineModulePath = sails.config.appPath + '/node_modules/' + sails.config.views.engine.ext, 
					fn;
				try {
					// 
					fn = consolidate(sails.config.appPath + '/node_modules')[sails.config.views.engine.ext];

					if ( !util.isFunction(fn) ) {
						throw new Error('Invalid view engine-- are you sure it supports `consolidate`?');
					}
				}
				catch (e) {
					log.error('Your configured server-side view engine (' + sails.config.views.engine.ext + ') could not be found.');
					log.error('Usually, this just means you need to install a dependency.');
					log.error('To install ' + sails.config.views.engine.ext + ', run:  `npm install ' + sails.config.views.engine.ext + ' --save`');
					log.error('Otherwise, please change your `engine` configuration in config/views.js.');
					throw e;
				}

				// Save reference to view rendering function
				sails.config.views.engine.fn = fn;
			}


			// Let user know that a leading . is not required in the viewEngine option and then fix it
			if (sails.config.views.engine.ext[0] === '.') {
				log.warn('A leading `.` is not required in the views.engine option.  Removing it for you...');
				sails.config.views.engine.ext = sails.config.views.engine.ext.substr(1);
			}

			// Custom layout location
			// (if string specified, it's used as the relative path from the views folder)
			// (if not string, but truthy, relative path from views folder defaults to ./layout.*)
			// (if falsy, don't use layout)
			if ( !util.isString(sails.config.views.layout) && sails.config.views.layout ) {
				sails.config.views.layout = 'layout.' + sails.config.views.engine.ext;
			}

			if ( sails.config.views.engine.ext !== 'ejs' &&
					sails.config.views.layout ) {
				sails.log.warn('Sails\' built-in layout support only works with the `ejs` view engine.');
				sails.log.warn('You\'re using `'+ sails.config.views.engine.ext +'`, which very well may have its own built-in layout support.');
				sails.log.warn('But that\'s up to you to figure out!  Ignoring `config.layout`...');
			}

		},


		/**
		 * "Teach" router to understand direct references to views.
		 */
		_interpretRouteSyntax: function (route) {
			var target = route.target,
				path = route.path,
				verb = route.verb,
				options = route.options;

			if (util.isObject(target) && !util.isFunction(target) && !util.isArray(target)) {
				
				// Support { view: 'foo/bar' } notation
				if (util.isString(target.view)) {
					return this.bindView(path, target, verb);
				}
			}

			// Ignore unknown route syntax
			// If it needs to be understood by another hook, the hook would have also received
			// the typeUnknown event, so we're done.
			return;
		},


		/**
		 * Logic to inject before each middleware runs
		 */
		_interceptRoute: function (event) {
			var req = event.req,
				res	= event.res,
				next = event.next,
				options = event.options;

			// Merge in any view locals specified in route options
			if (options.locals) {
				util.extend(res.locals, options.locals);
			}
		},




		/**
		 * Bind route to a view
		 */
		bindView: function ( path, target, verb ) {

			// Get view names
			var view = target.view.split('/')[0];
			var subview = target.view.split('/')[1] || 'index';

			// Look up appropriate view and make sure it exists
			var viewMiddleware = sails.middleware.views[view];
			// Dereference subview if the top-level view middleware is actually an object
			if (util.isPlainObject(viewMiddleware)) {
				viewMiddleware = viewMiddleware[subview];
			}

			// If a view was specified but it doesn't match, 
			// ignore the attempt and inform the user
			if ( !viewMiddleware ) {
				sails.log.error(
					'Ignoring attempt to bind route (' + 
					path + ') to unknown view: ' + target.view
				);
				return;
			}

			// Make sure the view function (+/- policies, etc.) is usable
			// If it's an array, bind each action to the destination route in order
			else if (util.isArray(viewMiddleware)) {
				util.each(viewMiddleware, function (fn) {
					sails.router.bind(path, viewHandler(fn), verb, target);
				});
				return;
			}
			
			// Bind an action which renders this view to the destination route
			else {
				sails.router.bind(path, viewHandler(viewMiddleware), verb, target);
				return;
			}


			// Wrap up the view middleware to supply access to
			// the original target when requests comes in
			function viewHandler (originalFn) {

				if ( !util.isFunction(originalFn) ) {
					sails.log.error(
						'Error binding view to route :: View middleware is not a function!', 
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
		},



		/**
		 * 
		 * @api private
		 */
		implementEjsLayouts: function (cb) {

			// If layout config is set, attempt to use view partials/layout
			if (sails.config.views.layout) {

				// If `http` hook is not enabled, we can't use partials
				// (depends on express atm)
				if (sails.hooks.http) {

					// Use ejs-locals for all ejs templates
					if (sails.config.views.engine.ext === 'ejs') {

						// Wait until express is ready, then configure the view engine
						return sails.after('hook:http:loaded', function () {

							// TODO: Use server-agnostic config flush
							// (rather than the current Express-specific approach)
							sails.log.verbose('Setting view engine to ' + sails.config.views.engine.ext + '...');
							sails.hooks.http.app.engine('ejs', ejsLayoutEngine);

							cb();
						});
					}

				}
			}

			return cb();
		},



		/**
		 * Load views and generate view-serving middleware for each one
		 *
		 * @api private
		 */
		detectAndPrepareViews: function (cb) {

			var self = this;
			this.glob(function (err, detectedViews) {
				if (err) return cb(err);

				// Save existence tree in `sails.views` for consumption later
				sails.views = detectedViews;

				// Generate view-serving middleware and stow it in `self.middleware`
				self._createMiddleware(detectedViews);

				cb();
			});

		},



		/**
		 * Exits with a tree indicating which views exist
		 */

		glob: function (cb) {
			
			// Load views, just so we know whether they exist or not
			sails.modules.optional({
				dirname: sails.config.paths.views,
				filter: /(.+)\..+$/,
				replaceExpr: null,
				dontLoad: true
			}, cb);
		},




		/**
		 * Generates view-serving middleware for each view
		 */

		_createMiddleware: function (detectedViews) {

			// If there are any matching views which don't have an action
			// create middleware to serve them
			util.each(detectedViews, function (view, id) {

				// Create middleware for a top-level view
				if (view === true) {
					// sails.log.verbose('Building middleware chain for view: ', id);
					this.middleware[id] = this._serveView(id);
				}

				// Create middleware for each subview
				else {
					this.middleware[id] = {};
					for (var subViewId in detectedViews[id]) {
						// sails.log.verbose('Building middleware chain for view: ', id, '/', subViewId);
						this.middleware[id][subViewId] = this._serveView(id, subViewId);
					}
				}

			}, this);
		},

		/**
		 * Returns a middleware chain that remembers a view id and
		 * runs simple middleware to template and serve the view file.
		 * Used to serve views w/o controllers
		 *
		 * (This concatenation approach is crucial to allow policies to be bound)
		 */

		_serveView: function (viewId, subViewId) {

			// Save for use in closure
			// (handle top-level and subview cases)
			var viewExpression = viewId + (subViewId ? '/' + subViewId : '');

			return [function rememberViewId(req, res, next) {

				// Save reference for view in res.view() middleware
				// (only needs to happen if subViewId is not set [top-level view])
				if (viewId) {
					if (req.target) {
						req.target.view = viewExpression;
					} else {
						req.target = {
							view: viewExpression
						};
					}
				}

				next();

			}].concat(function serveView(req, res, next) {
				res.view();
			});
		}
	};



	/**
	 * For all routes:
	 *
	 * Adds res.view() method (an enhanced version of res.render) to response object
	 * res.view() automatically renders the appropriate view based on the calling middleware's source route
	 * Note: the original function is still accessible via res.render()
	 * 
	 * @middleware
	 * @api public
	 */

	function _addResViewMethod(req, res, next) {

		/**
		 * res.view([specifiedPath|locals], [locals])
		 *
		 * @param {String} specifiedPath
		 *				-> path to the view file to load (minus the file extension)
		 *					relative to the app's `views` directory
		 * @param {Object} locals
		 *				-> view locals (data that is accessible in the view template)
		 * @param {Function} cb_view(err)
		 *				-> called when the view rendering is complete (response is already sent, or in the process)
		 *					(probably should be @api private)
		 * @api public
		 */

		res.view = function (specifiedPath, locals, cb_view) {
			sails.log.verbose('Running res.view(' + (specifiedPath ? specifiedPath : '') + ') method...');

			locals = util.clone(locals) || {};

			// By default, generate a path to the view using what we know about the controller+action
			var relPathToView;
			if (!req.target) {
				req.target = {};
			}

			// Backwards compatibility, route to controller/action
			if (!req.target.view) {
				relPathToView = req.target.controller + "/" + req.target.action;
			}
			// Use the new view config
			else relPathToView = req.target.view;


			// If a map of locals is provided as the first argument,
			if (util.isObject(specifiedPath)) {

				// Use the locals argument as the specifiedPath if it makes sense
				// otherwise, just use the default
				var pathAsSecondArg = util.isString(locals) ? locals : undefined;

				// use it as locals, not the path
				locals = specifiedPath;

				specifiedPath = pathAsSecondArg;
			}

			// If the path to a view was explicitly specified, use that
			// Serve the view specified
			if (util.isString(specifiedPath)) {
				relPathToView = specifiedPath;
			}
			// If the path was specified, but invalid
			else if (specifiedPath) {
				return res.serverError(new Error('Specified path for view (' + specifiedPath + ') is invalid!'));
			}

			// Trim trailing slash 
			if (relPathToView[(relPathToView.length - 1)] === '/') {
				relPathToView = relPathToView.slice(0, -1);
			}

			// if local `layout` is set to true or unspecified
			// fall back to global config
			var layout = locals.layout;
			if (locals.layout === undefined || locals.layout === true) {
				layout = sails.config.views.layout;
			}

			// Disable sails built-in layouts for all view engine's except for ejs
			if (sails.config.views.engine.ext !== 'ejs') {
				layout = false;
			}

			
			// Set layout file if enabled (using ejs-locals)
			if (layout) {

				// Solve relative path to layout from the view itself
				// (required by ejs-locals module)
				var pathToViews = sails.config.paths.views;
				var absPathToLayout = pathToViews + '/' + layout;
				var absPathToView = pathToViews + '/' + relPathToView;
				var relPathToLayout = path.relative( path.dirname(absPathToView), absPathToLayout);

				// If a layout was specified, set view local so it will be used
				res.locals._layoutFile = relPathToLayout;
			}


			// Render the view
			return res.render(relPathToView, locals, function (err, renderedViewStr) {
				if (err) {
					sails.log.error('Error rendering view at ::',absPathToView);
					sails.log.error('Using layout located at ::', absPathToLayout);
					return res.serverError(err);
				}

				if (layout) { sails.log.verbose('Using layout: ', absPathToLayout); }
				sails.log.verbose('Rendering view ::', relPathToView, '(located @ ' + absPathToView + ')');
				
				// Trigger res.view callback if specified
				// (before sending the response)
				if (cb_view) {
					sails.log.warn(
						'Callback function of `res.view([relativePathToView], [options], [cb])`',
						' will be deprecated in an upcoming release.'
					);
					cb_view(err);
				}

				// Extend locals with locals passed in
				util.extend(res.locals, locals);

				// Finally, send the view down to the client
				res.send(renderedViewStr);

				// HARD_DEPENDENCY: express@3.4.0
				// 
				// While unlikely this will change, it's worth noting that this implementation
				// relies on express's private implementation of res.render() here:
				// https://github.com/visionmedia/express/blob/master/lib/response.js#L799
				// 
				// To be safe, the version of the Express dependency in package.json will remain locked
				// until it can be verified that each subsequent version is compatible.  Even patch releases!!
			});



		};

		next();
	}


};