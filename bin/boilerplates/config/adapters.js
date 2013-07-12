/**
 * Global adapter config
 * 
 * If you define an attribute in your model definitions, 
 * it will override anything from this global config.
 *
 * For more information on adapters, check out:
 * http://sailsjs.org/#documentation
 */
 
module.exports.adapters = {

	// If you leave the adapter config unspecified 
	// in a model definition, 'default' will be used.
	'default': 'disk',
	
	// In-memory adapter for DEVELOPMENT ONLY
	memory: {
		module: 'sails-memory'
	},

	// Persistent adapter for DEVELOPMENT ONLY
	// (data IS preserved when the server shuts down)
	disk: {
		module: 'sails-disk'
	},

	// MySQL is the world's most popular relational database.
	// Learn more: http://en.wikipedia.org/wiki/MySQL
	mysql: {
		module		: 'sails-mysql',
		host		: 'YOUR_MYSQL_SERVER_HOSTNAME_OR_IP_ADDRESS',
		user		: 'YOUR_MYSQL_USER',
		password	: 'YOUR_MYSQL_PASSWORD',
		database	: 'YOUR_MYSQL_DB'
	}
};