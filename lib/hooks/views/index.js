module.exports = function (sails) {
	

	/**
	 * Module dependencies.
	 */


	var _		= require( 'lodash' ),
		util	= require( '../../util' );


	/**
	 * Expose Hook definition
	 */

	return {

		initialize: function (cb) {

			this.loadViewsAsMiddleware();

			cb();
		},


		/**
		 * Load views and generate view-serving middleware for each one
		 */

		loadViewsAsMiddleware: function () {

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
					self.middleware[id] = ViewMiddleware;
				}

				// Create middleware for each subview
				else {
					self.middleware[id] = {};
					for (var subViewId in sails.views[id]) {
						self.middleware[id][subViewId] = ViewMiddleware;
					}
				}

			});
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
				 * @api private
				 */
				'*': function addResViewMethod ( req, res, next ) {

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
