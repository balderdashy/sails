/**
 * Module dependencies
 */

var _ = require('lodash');



/**
 * Load views and generate view-serving middleware for each one
 *
 * @param  {Sails}    sails
 * @param  {Hook}     hook
 * @param  {Function} cb
 * @api private
 */

module.exports = function detectAndPrepareViews (sails, hook, cb) {

	glob(function (err, detectedViews) {
		if (err) return cb(err);

		// Save existence tree in `sails.views` for consumption later
		sails.views = detectedViews || {};

		// Generate view-serving middleware and stow it in `hook.middleware`
		createMiddleware(detectedViews);

		cb();
	});


	/**
	 * Generates view-serving middleware for each view
	 */

	function createMiddleware (detectedViews) {

		// If there are any matching views which don't have an action
		// create middleware to serve them
		_.each(detectedViews, function (view, id) {

			// Create middleware for a top-level view
			if (view === true) {
				sails.log.silly('Building action for view: ', id);
				hook.middleware[id] = serveView(id);
			}

			// Create middleware for each subview
			else {
				hook.middleware[id] = {};
				for (var subViewId in detectedViews[id]) {
					sails.log.silly('Building action for view: ', id, '/', subViewId);
					hook.middleware[id][subViewId] = serveView(id, subViewId);
				}
			}

		}, hook);
	}


	/**
	 * Exits with a tree indicating which views exist
	 */

	function glob (cb) {
		
		// Glob/stat views so we know whether they exist or not
		sails.modules.statViews(cb);
	}





	/**
	 * Returns a middleware chain that remembers a view id and
	 * runs simple middleware to template and serve the view file.
	 * Used to serve views w/o controllers
	 *
	 * (This concatenation approach is crucial to allow policies to be bound)
	 * 
	 * @param  {[type]} viewId    [description]
	 * @param  {[type]} subViewId [description]
	 * @return {Array}
	 */

	function serveView (viewId, subViewId) {

		// Save for use in closure
		// (handle top-level and subview cases)
		var viewExpression = viewId + (subViewId ? '/' + subViewId : '');

		return [function rememberViewId(req, res, next) {

			// Save reference for view in res.view() middleware
			// (only needs to happen if subViewId is not set [top-level view])
			if (viewId) {
				req.options.view = viewExpression;
			}

			next();

		}].concat(function serveView(req, res) {
			res.view();
		});
	}
};

