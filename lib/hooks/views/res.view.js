/**
 * Module dependencies
 */

var path			= require('path')
	, _ = require('lodash');


/**
 * Adds res.view() method (an enhanced version of res.render) to response object.
 * `res.view()` automatically renders the appropriate view based on the calling middleware's source route
 * Note: the original function is still accessible via res.render()
 * 
 * @param {Request}  req
 * @param {Response} res
 * @param {Function} next
 */

module.exports = function _addResViewMethod(req, res, next) {

	var sails = req._sails;


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

		
		sails.log.verbose('Running res.view(' + (specifiedPath ? specifiedPath : '') + ')...');

		// By default, generate a path to the view using what we know about the controller+action
		var relPathToView;

		// Ensure req.target is an object, then merge it into req.options
		// (this helps ensure backwards compatibility for users who were relying
		//  on `req.target` in previous versions of Sails)
		req.options = _.defaults(req.options, req.target || {});

		// Try to guess the view by looking at the controller/action
		if (!req.options.view) {
			relPathToView = req.options.controller + '/' + req.options.action;
		}
		// Use the new view config
		else relPathToView = req.options.view;

		// Now we have a reasonable guess in `relPathToView`

		// If the path to a view was explicitly specified, use that
		// Serve the view specified
		// 
		// If first arg is not an object, treat it like the path
		if ( specifiedPath && !_.isObject(specifiedPath)) {
			relPathToView = specifiedPath;
		}
		// If first arg ISSSSS AN object, treat it like locals
		else if (_.isObject(specifiedPath)) {

			// If the "locals" argument is actually the "specifiedPath"
			// give em the old switcheroo
			relPathToView = locals || relPathToView;
			locals = specifiedPath;
		}
		

		// Ensure specifiedPath is a string (important)
		relPathToView = '' + relPathToView + '';

		// TODO: determine if this deep clone is necessary
		locals = _.cloneDeep(locals || {});

		// Mixin locals from req.options
		if (req.options.locals) {
			locals = _.merge(locals, req.options.locals);
		}
		
		// If the path was specified, but invalid
		// else if (specifiedPath) {
		// 	return res.serverError(new Error('Specified path for view (' + specifiedPath + ') is invalid!'));
		// }

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

		
		var pathToViews = sails.config.paths.views;
		var absPathToView = path.join(pathToViews, relPathToView);

		
		// Set layout file if enabled (using ejs-locals)
		if (layout) {

		// Solve relative path to layout from the view itself
		// (required by ejs-locals module)
			var absPathToLayout = path.join(pathToViews, layout);
			var relPathToLayout = path.relative( path.dirname(absPathToView), absPathToLayout);


			// If a layout was specified, set view local so it will be used
			res.locals._layoutFile = relPathToLayout;
			sails.log.silly('Using layout at: ', absPathToLayout);
		}

		// Locals passed in to `res.view()` override app and route locals.
		_.each(locals, function (local, key) {
			res.locals[key] = local;
		});


		// Provide access to view metadata in locals
		// (for convenience)
		res.locals.view = res.locals.view || {
			path: relPathToView,
			absPath: absPathToView,
			pathFromViews: relPathToView,
			pathFromApp: path.join( path.relative(sails.config.appPath, sails.config.paths.views), relPathToView ),
			ext: sails.config.views.engine.ext
		};


		// In development, provide access to complete path to view
		// via `__dirname`
		if ( sails.config.environment !== 'production' ) {
			res.locals.__dirname = res.locals.__dirname ||
				absPathToView + '.' + sails.config.views.engine.ext;
		}


		// Render the view
		sails.log.silly('Specified view: ', specifiedPath);
		sails.log.silly('Serving view at rel path: ', relPathToView);
		sails.log.silly('View root: ', sails.config.paths.views);
		return res.render(relPathToView, function renderView (err, renderedViewStr) {
			

			// if a template error occurred, don't rely on any of the Sails request/response methods
			// (since they may not exist yet at this point in the request lifecycle.)
			if (err) {
				sails.log.error('Error rendering view at ::',absPathToView);
				sails.log.error('with layout located at ::', absPathToLayout);
				sails.log.error(err);
				if (process.env.NODE_ENV === 'development') {
					return res.json(500, err);
				}
				else return res.send(500);
			}

			if (layout) { sails.log.verbose('Using layout: ', absPathToLayout); }
			sails.log.verbose('Rendering view ::', relPathToView, '(located @ ' + absPathToView + ')');
			
			// Backwards compatibility:
			// trigger `res.view` callback if specified
			// (before sending the response)
			if (cb_view) {
				sails.log.warn(
					'Callback function of `res.view([relativePathToView], [options], [cb])`',
					' will be deprecated in an upcoming release.'
				);
				cb_view(err);
			}

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
};
