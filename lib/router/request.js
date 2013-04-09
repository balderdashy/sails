var _ = require('underscore');
_.str = require('underscore.string');

module.exports = function enhanceRequest(req, res, controllerName, actionName) {

	// Provide error messages for req.listen and res.broadcast if they don't exist
	req.listen = req.listen || notSupported("req.listen()");
	res.broadcast = res.broadcast || notSupported("res.broadcast()");

	// Always share some data with views
	res.locals({
		userAgent: req.headers['user-agent'],
		session: req.session,
		title: sails.config.appName + " | " + _.str.capitalize(actionName),
		controller: controllerName,
		action: actionName,
		req: req,
		res: res
	});

	// Add req.protocol
	req.protocol = req.protocol ? req.protocol : req.header('X-Forwarded-Protocol') == "https" ? "https" : "http";

	// Add req.host
	// (remove port if it exists)
	req.host = req.host || req.header('host');
	req.rawHost = req.host.split(':')[0];

	// Add req.port
	req.port = req.port ? req.port : sails.express.app.address().port;

	// Add req.rootUrl convenience method
	req.rootUrl = req.protocol + '://' + req.rawHost + (req.port == 80 || req.port == 443 ? '' : ':' + req.port);


	// Set action and controller as request parameters for use in controllers and views
	req.params = req.params || {};
	req.params.controller = req.params.entity = controllerName;
	req.params.action = actionName;

	// Add *verb* attribute to request object
	req.verb = req.method;

	// Add flags to request object
	req.isAjax = req.xhr;
	req.isJson = req.header('content-type') === 'application/json';
	req.acceptJson = req.header('Accept') === 'application/json';
	req.isJsony = req.isJson || req.acceptJson;

	// Add res.view() method to response object
	// res.view() is an enhanced version of  Express's res.render()
	// which automatically renders the appropriate view based on the entity and action
	// Note: the original function is still accessible via res.render()
	res.view = function(specifiedPath, data, fun) {
		data = data || {};

		// By default, generate a path to the view using what we know about the controller+action
		var path = req.param('entity') + "/" + req.param('action');

		// If the path to a view was explicitly specified, use that
		if(_.isString(specifiedPath)) {
			path = specifiedPath;
		}
		// If a map of data is provided as the first argument, use it (and just use the default path)
		else if(_.isObject(specifiedPath)) {
			data = specifiedPath;
		}

		// TODO: work with the appropriate Adapters to fulfill promise objects in *data*

		res.render(path, data, fun);
	};

	// Respond with a message indicating that the feature is not currently supported
	function notSupported(method) {
		return function() {
			sails.log.warn(method + " is only supported using Socket.io!");
		};
	}
};