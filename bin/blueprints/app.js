// lift sails                                                                                                          
require('sails').lift({
	// Name of the application (for HTML title entity)
	appName: "Sails Application",

	// Path to application root (defaults to current directory, or __dirname)
	appPath: __dirname,

	// The environment the app is deployed in (`development`, `production`, or `test`)
	environment: 'development'
});