// Build a dictionary of all the app's models
var models = {};

var modelFiles = require('require-all')({ 
		dirname: sails.config.appPath + '/models',
		filter: /(.+)\.js$/
	});

// Go through each model and determine its identity
_.each(modelFiles,function (model, filename) {
	// If no 'identity' attribute was provided, take a guess based on the filename
	if (!model.identity) model.identity = filename.toLowerCase();
	models[model.identity] = model;
});

// Export model dictionary
_.extend(module.exports,models);