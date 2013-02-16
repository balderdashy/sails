// lift sails                                                                                                          
require('sails').lift({

	// Name of the application (for use in the HTML title entity)
	appName: "Sails Application",

	// Path to application root (defaults to current directory, or __dirname)
	appPath: __dirname,

	// Asset rack configuration
	assets: {

		// Destination for compiled assets
		outputPath: './.tmp',

		// Source directories, in order, which will be recursively parsed for css, javascript, and templates
		// and then can be automatically injected in your layout/views
		// ( assets.css(), assets.js() and assets.templateLibrary() )
		sequence: ['./ui/dependencies', './ui/public', './ui/views/templates']
	},

	// The environment the app is deployed in 
	// (`development` or `production`)
	environment: 'production',

	// Default model properties (can be overriden in models)
	modelDefaults: {
		adapter: 'memory'
	}
});
