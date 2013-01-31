// lift sails                                                                                                          
require('sails').lift({

	// Name of the application (for use in the HTML title entity)
	appName: "Sails Application",

	// Path to application root (defaults to current directory, or __dirname)
	appPath: __dirname,

	rigging: {

		// Destination for compiled assets
		outputPath: './.tmp',

		// Source directories, in order, which will be recursively parsed for css, javascript, and templates
		// and then automatically injected into your layout file.
		sequence: ['./ui/dependencies', './ui/public', './ui/views/templates']
	},

	// The environment the app is deployed in 
	// (`development`, `production`, or `test`)
	environment: 'development',

	// Default data store adapter 
	// (can be overriden in models)
	adapter: 'memory'
});
