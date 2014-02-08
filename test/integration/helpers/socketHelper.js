var fs = require('fs');

module.exports = {

	// Write routes object to router file
	writeRoutes: function(routes) {
		fs.writeFileSync('config/routes.js', 'module.exports.routes = ' + JSON.stringify(routes));
	},

	// Write routes object to blueprint config file
	writeBlueprint: function(config) {
		config = {blueprints: config};
		fs.writeFileSync('config/blueprints.js', 'module.exports = ' + JSON.stringify(config));
	},

	// Starts sails server, makes request, returns response, kills sails server
	testRoute: function(socket, method, options, callback) {

		var url, data = {};
		// Prefix url with domain:port
		if (typeof options === 'string') {
			url = options;
		} else {
			url = options.url;
		}

		if (method == 'get') {
			socket[method](url, function(response) {
				callback(null, response);
			});
		}

		else {
			socket[method](url, data, function(response) {
				callback(null, response);
			});
		}

	}
};
