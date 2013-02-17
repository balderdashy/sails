// lift sails                                                                                                          
require('sails').lift({

	// Name of the application (default for the layout <title>)
	appName: "Sails Application",

	// Asset rack configuration
	assets: {

		// Source directories, in order, which will be recursively parsed for css, javascript, and templates
		// and then can be automatically injected in your layout/views
		// ( assets.css(), assets.js() and assets.templateLibrary() )
		sequence: ['./ui/dependencies', './ui/public', './ui/views/templates']
	},

	// The environment the app is deployed in 
	// (`development` or `production`)
	environment: 'development',

	// Default model properties (can be overriden in models)
	modelDefaults: {

		// During development, store data on disk
		// In production, you'll want to change this 
		// to the adapter for your database of choice
		adapter: 'disk'
	}
});
