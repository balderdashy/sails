module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */


	var util			= require('../../util'),
		Modules			= require('../../moduleloader'),
		fs				= require('fs'),
		path			= require('path'),
		ejsLayoutEngine	= require('ejs-locals');


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


		/**
		 * Standard responsibilities of `initialize` are to load middleware methods
		 * and listen for events to know when to bind any special routes.
		 *
		 * @api private
		 */

		initialize: function (cb) {

			this.implementEjsLayouts();

			// Add res.view() method to compatible middleware
			sails.on('router:before', function () {
				sails.router.bind('/*', _addResViewMethod);
			});

			// Detect and prepare auto-route middleware for view files
			this.detectAndPrepareViews(cb);

		},


		/**
		 * 
		 * @api private
		 */

		implementEjsLayouts: function () {

			// If layout config is set, attempt to use view partials/layout
			if (sails.config.views.layout) {

				// If `http` hook is not enabled, we can't use partials
				// (depends on express atm)
				if (sails.hooks.http) {

					// Use ejs-locals for all ejs templates
					if (sails.config.views.engine.ext === 'ejs') {

						// TODO: Use server-agnostic config flush
						// (rather than the current Express-specific approach)
						sails.log.verbose('Setting view engine to ' + sails.config.views.engine.ext + '...');
						sails.express.app.engine('ejs', ejsLayoutEngine);

					}

				}
			}
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
			Modules.optional({
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
					sails.log.verbose('Building middleware chain for view: ', id);
					this.middleware[id] = this._serveView(id);
				}

				// Create middleware for each subview
				else {
					this.middleware[id] = {};
					for (var subViewId in detectedViews[id]) {
						sails.log.verbose('Building middleware chain for view: ', id, '/', subViewId);
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