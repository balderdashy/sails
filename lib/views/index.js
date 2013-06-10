
// Export module declaration
module.exports = {

	// Middleware that will be made available in apps
	middleware: {
		view: function (req,res) { res.view(); }
	},

	// Routes that will be automatically bound
	routes: {
		'*': addResViewMethod
	}

};



/**
 * Adds res.view() method (an enhanced version of res.render) to response object
 * res.view() automatically renders the appropriate view based on the calling middleware's source route
 * Note: the original function is still accessible via res.render()
 * 
 * @middleware
 * 
 */
function addResViewMethod (req, res, next) {

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
