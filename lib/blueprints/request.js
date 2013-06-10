var _ = require('lodash');
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
	req.port = req.port ? req.port : sails.express.server.address().port;

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

	

	// Respond with a message indicating that the feature is not currently supported
	function notSupported(method) {
		return function() {
			sails.log.warn(method + " is only supported using Socket.io!");
		};
	}
};