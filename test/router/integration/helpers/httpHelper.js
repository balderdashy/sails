var request = require('request');
var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = {

	// Write routes object to router file
	writeRoutes: function(routes) {
		fs.writeFileSync('config/routes.js', 'module.exports.routes = ' + JSON.stringify(routes));
	},

	// Write routes object to blueprint config file
	writeBlueprint: function(config) {
		config = {controllers: {blueprints: config}};
		fs.writeFileSync('config/controllers.js', 'module.exports = ' + JSON.stringify(config));
	},

	// Starts sails server, makes request, returns response, kills sails server
	testRoute: function(method, options, callback) {

		// Prefix url with domain:port
		if (typeof options === 'string') {
			options = 'http://localhost:1337/' + options;
		} else {
			options.url = 'http://localhost:1337/'  + options.url;
		}

		// Start the sails server process
		var sailsprocess = spawn('../bin/sails.js', ['lift', '--dev']);

		sailsprocess.stdout.on('data',function(data) {
			// Change buffer to string
			var dataString = data + '';

			// Make request once server has sucessfully started
			if (dataString.match(/Server lifted/)) {
				sailsprocess.stdout.removeAllListeners('data');
				setTimeout(function () {
					request[method](options, function(err, response) {
						if (err) callback(err);

						// Kill server process and return response
						sailsprocess.kill();
						callback(null, response);
					});
				}, 1000);
			}
		});
	}
};
