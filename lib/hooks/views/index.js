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

		initialize: function (cb) {
			var self = this;

			this.loadViewsAsMiddleware(function (err) {
				if (err) return cb(err);

				

				self.createRoutesForViews();


				////////////////////////////////////////////////////////////////
				// Proposal: (to make it backwards compat. with how it worked in 0.8.x)
				// Not sure about this-- feedback anyone?
				// Let me know: @mikermcneil
				////////////////////////////////////////////////////////////////
				// If the `controllers` hook is enabled, we must wait to 
				// create dynamic routes for views until the CRUD blueprints are in place
				// since the view bindings should override crud bindings
				/*
				if (sails.config.hooks.controllers) {
					sails.on('hook:controllers:boundCRUDRoutes', createRoutesForViews)
				}

				*/
				////////////////////////////////////////////////////////////////

				cb();
			});
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
					this.routes.after['get /' + id] = middleware;
					return;
				}

				// Create middleware for each subview
				else {

					// Build a route to serve each view
					for (var subViewId in middleware) {

						// Build a route to serve each subview
						// (if this is `index`, also create a top-level route)
						if (subViewId === 'index') {
							this.routes.after['get /' + id] = middleware[subViewId];
						}
						this.routes.after['get /' + id + '/' + subViewId] = middleware[subViewId];
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

			// Simple view middleware used to serve views w/o controllers
			function ViewMiddleware (req,res) {
				res.view();
			}

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
					this.middleware[id] = ViewMiddleware;
				}

				// Create middleware for each subview
				else {
					this.middleware[id] = {};
					for (var subViewId in sails.views[id]) {
						this.middleware[id][subViewId] = ViewMiddleware;
					}
				}

			}, this);

			cb();
		},
		


		/**
		 * Routes to bind before or after routing
		 */

		routes: {
			
			before: {

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

				'/*': function addResViewMethod ( req, res, next ) {

					res.view = function (specifiedPath, data, fun) {
						data = data || {};

						// By default, generate a path to the view using what we know about the controller+action
						var path = req.entity + "/" + req.action;

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
			},

			after: {}
		}
	};

};
