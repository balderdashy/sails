// Build a dictionary of all the app's controllers
var controllers = {};

var controllerFiles = require('require-all')({ 
		dirname: sails.config.appPath + '/controllers',
		filter: /(.+Controller)\.js$/
	});

// Go through each controller and determine its identity
_.each(controllerFiles,function (controller, filename) {
	// If no 'identity' attribute was provided, 
	// take a guess based on the filename
	if (!controller.identity) {
		controller.identity = filename.replace(/Controller/, "").toLowerCase();
	}
	controllers[controller.identity] = controller;
});

// Export controller dictionary
_.extend(module.exports,controllers);