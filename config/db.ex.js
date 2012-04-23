exports.model = null;


var datasource = exports.datasource = {
	database: 'dbname',
	username: 'username',
	password: 'password'
}


// Execute custom application logic 
// (i.e. automatically register a couple of admin users for testing)
exports.bootstrap = function () {
	
}


exports.sync = function () {
	// Connect and sync
	sequelize.sync().success(function() {
		console.log("ORM sync successful!");
	});
}

/**
 * Database bootstrap
 * Connect and define associations and schema
 */
exports.initialize = function () {

	// Connect to database
	sequelize = exports.model = new Sequelize(
		datasource.database, 
		datasource.username,
		datasource.password
	);
}
