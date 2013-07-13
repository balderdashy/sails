module.exports = function (sails) {
	

	/**
	 * Module dependencies.
	 */


	var util			= require( '../../util' ),
		Modules			= require('../../moduleloader');


	/**
	 * Global access to _addResViewMethod middleware
	 * (useful as a helper-- but only for hacks)
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

			// If the `controllers` hook is enabled, we must wait to 
			// create dynamic routes for views until the action blueprints are in place
			// since explicit controller actions should override view bindings
			if (sails.config.hooks.controllers) {
				sails.on('hook:controllers:bound:actions', this.createRoutesForViews);
			}
			// Otherwise bind routes for each view as soon as the router is ready
			else sails.on('router:after', this.createRoutesForViews);


			// Add res.view() method to compatible middleware
			sails.on('router:before', function () {
				sails.router.bind('/*', _addResViewMethod);
			});

			// Detect and prepare auto-route middleware for view files
			this.detectAndPrepareViews(cb);

		},


		/**
		 * Dynamically create routes for views
		 *
		 * @api private
		 */

		createRoutesForViews: function () {

			if (sails.config.views.blueprints) {

				// If layout config is set, attempt to use view partials/layout
				if (sails.config.views.layout) {

					// If `http` hook is not enabled, we can't use partials
					// (depends on express atm)
					if (sails.config.hooks.http) {

						// Use ejs-locals for all ejs templates
						if (sails.config.views.engine === 'ejs') {

							// TODO: Uase server-agnostic config flush 
							// (rather than the current Express-specific approach)
							var ejsLayoutEngine = require('ejs-locals');
							sails.express.app.engine('ejs', ejsLayoutEngine);

						}
						else {
							sails.log.warn(
								'Cannot use `partials` hook with your current view engine :: ' + 
								sails.config.views.engine);
						}
						
					}

				}

				util.each(this.middleware, function (middleware, id) {

					// Create middleware for a top-level view
					if (!util.isDictionary(middleware)) {
						sails.router.bind('get /' + id, middleware);
						return;
					}

					// Create middleware for each subview
					else {

						// Build a route to serve each view
						for (var subViewId in middleware) {

							// Build a route to serve each subview
							sails.router.bind('get /' + id + '/' + subViewId, middleware[subViewId]);

							// (if this is `index`, also create a top-level route)
							if (subViewId === 'index') {
								sails.router.bind('get /' + id, middleware[subViewId]);
							}
						}
					}

				}, this);
			}

			// After routing, fire an event so other hooks can wait until we're finished
			sails.emit('hook:views:bound');

			this.ready = true;

		},



		/**
		 * Load views and generate view-serving middleware for each one
		 *
		 * @api private
		 */

		detectAndPrepareViews: function (cb) {

			// Load views, just so we know whether they exist or not
			sails.views = Modules.optional({
				dirname		: sails.config.paths.views,
				filter		: /(.+)\..+$/,
				replaceExpr	: null,
				dontLoad	: true
			});

			// If there are any matching views which don't have an action
			// create middleware to serve them
			util.each(sails.views, function (view, id) {

				// Create middleware for a top-level view
				if (view === true) {
					sails.log.verbose('Building middleware chain for view: ', id);
					this.middleware[id] = this._serveView(id);
				}

				// Create middleware for each subview
				else {
					this.middleware[id] = {};
					for (var subViewId in sails.views[id]) {
						sails.log.verbose('Building middleware chain for view: ', id,'/',subViewId);
						this.middleware[id][subViewId] = this._serveView(id, subViewId);
					}
				}

			}, this);

			cb();
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

			return [function rememberViewId (req, res, next) {

				// Save reference for view in res.view() middleware
				// (only needs to happen if subViewId is not set [top-level view])
				if (viewId) {
					if (req.target) {
						req.target.view = viewExpression;
					}
					else {
						req.target = {
							view: viewExpression
						};
					}
				}

				next();

			}].concat(function serveView (req, res, next) {
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

	function _addResViewMethod ( req, res, next ) {

		res.view = function (specifiedPath, data, fun) {
			sails.log.verbose('Running res.view(' + (specifiedPath ? specifiedPath : '') + ') method...');
			
			data = _.clone(data) || {};

			// By default, generate a path to the view using what we know about the controller+action
			var path;
			if (!req.target) {
				req.target = {};
			}

			// Backwards compatibility, route to controller/action
			if (!req.target.view) {
				path = req.target.controller + "/" + req.target.action;
			}
			// Use the new view config
			else path = req.target.view;


			// If a map of data is provided as the first argument, use it
			// (with use the default path)
			if (util.isObject(specifiedPath)) {
				data = specifiedPath;
			}

			// If the path to a view was explicitly specified, use that
			// Serve the view specified
			if (util.isString(specifiedPath)) {
				path = specifiedPath;
			}
			// If the path was specified, but invalid
			else if (specifiedPath) {
				return next(new Error('Specified path for view (' + specifiedPath + ') is invalid!'));
			}
			
			// Trim trailing slash 
			if (path[(path.length-1)] === '/') {
				path = path.slice(0,-1);
			}

			// Set layout file (using ejs-locals)
			if (sails.config.views.layout) {

				// TODO: use a full, canonical path to the view
				// (at least relative to the approot using path magic)

				// Figure out if this is a subview or a top-level view
				// And determine the relative path to the layout file accordingly
				var isSubView = ( (path.split('/')).length > 1 );
				var relativePathToLayout = (isSubView ? '../' : '') + sails.config.views.layout;

				// Determine the layout to use
				sails.log.verbose('Rendering layout at: ', relativePathToLayout);
				res.locals._layoutFile = relativePathToLayout;
			}

			sails.log.verbose('Rendering view at: ', path);
			return res.render(path, data, fun);
		};

		next();
	}


};
