// lift sails                                                                                                          
require('sails').lift({
	// Name of the application (for HTML title entity)
	appName: "Sails Application",

	// Path to application root (usually __dirname)
	appPath: __dirname,

	// The environment the app is deployed in
	appEnvironment: 'development',

	// The datasource configuration
	// (for larger teams, this can be externalized into a separate config file 
	// to avoid version control collisions)
	datasource: {
		database: 'nameOfYourMySQLDatabase',
		username: 'usernameForYourMySQLInstallation',
		password: 'passwordForYourMySQLInstallation'
	}
});