// lift sails                                                                                                          
require('sails').lift({
        appName: "Name of your application",

        appPath: __dirname,

        appEnvironment: 'development',

        datasource: {
			database: 'nameOfYourMySQLDatabase',
			username: 'usernameForYourMySQLInstallation',
			password: 'passwordForYourMySQLInstallation'
		},

        rigging: false
});