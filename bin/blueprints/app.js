// lift sails                                                                                                          
require('sails').lift({
	// Name of the application (for HTML title entity)
	appName: "Sails Application",

	// Path to application root (defaults to current directory, or __dirname)
	appPath: __dirname,

	// source and destination for automatically compiled assets.
	rigging: {
		outputPath: './.compiled',
		sequence: ['./public/dependencies', './public/js', './public/styles', './public/templates']
	},

	// The environment the app is deployed in (`development`, `production`, or `test`)
	environment: 'development'
});