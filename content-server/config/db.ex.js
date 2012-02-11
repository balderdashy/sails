exports.Sequelize = Sequelize;
exports.model = null;


var datasource = exports.datasource = {
	database: 'dbname',
	username: 'username',
	password: 'password'
}


/**
 * Database bootstrap
 * Connect and define associations and schema
 */
exports.bootstrap = function () {

	// Connect to database
	var sequelize = exports.model = new Sequelize(
		datasource.database, 
		datasource.username,
		datasource.password
	);
	
	// Connect and sync
	sequelize.sync().success(function() {
		console.log("DB Connection successful!");
	});

}