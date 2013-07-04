module.exports = function (sails) {
	

	/**
	 * Module dependencies.
	 */


	var _		= require( 'lodash' ),
		async	= require( 'async' ),
		util	= require( '../../util' ),
		Modules = require('../../moduleloader');


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


			this.loadViewsAsMiddleware(cb);
		},


		/**
		 * Dynamically create routes for views
		 *
		 * @api private
		 */

		createRoutesForViews: function () {

			_.each(this.middleware, function (middleware, id) {

				// Create middleware for a top-level view
				if (_.isFunction(middleware)) {
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

			// After routing, fire an event so other hooks can wait until we're finished
			sails.emit('hook:views:bound');
		},



		/**
		 * Load views and generate view-serving middleware for each one
		 *
		 * @api private
		 */

		loadViewsAsMiddleware: function (cb) {

			// Load views, just so we know whether they exist or not
			sails.views = Modules.optional({
				dirname		: sails.config.paths.views,
				filter		: /(.+)\..+$/,
				replaceExpr	: null,
				dontLoad	: true
			});

			// If there are any matching views which don't have an action
			// create middleware to serve them
			_.each(sails.views, function (view, id) {

				// Create middleware for a top-level view
				if (view === true) {
					this.middleware[id] = _serveView;
				}

				// Create middleware for each subview
				else {
					this.middleware[id] = {};
					for (var subViewId in sails.views[id]) {
						this.middleware[id][subViewId] = _serveView;
					}
				}

			}, this);

			cb();
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
			data = data || {};

			// By default, generate a path to the view using what we know about the controller+action
			var path = req.target.controller + "/" + req.target.action;

			// If the path to a view was explicitly specified, use that
			if(_.isString(specifiedPath)) {
				path = specifiedPath;
			}
			// If a map of data is provided as the first argument, use it (and just use the default path)
			else if(_.isObject(specifiedPath)) {
				data = specifiedPath;
			}

			res.render(path, data, fun);
		};

		next();
	}



	/**
	 * Simple view middleware used to serve views w/o controllers
	 */

	function _serveView (req,res) {

		// Then serve the view
		res.view();
	}

};
