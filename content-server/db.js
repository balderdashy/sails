var Sequelize = require("sequelize");
var config = require("./config");

exports.Sequelize = Sequelize;
exports.model = null;

/**
 * Database bootstrap
 * Connect and define associations and schema
 */
exports.bootstrap = function () {

	// Connect to database
	var sequelize = exports.model = new Sequelize(
		config.db.database, 
		config.db.username,
		config.db.password
	);

	///////////////////////////////////////////////////////////////////////////
	// Build associations
	///////////////////////////////////////////////////////////////////////////
//	Collection.hasMany(Content);
//	Content.hasMany(Collection);


	///////////////////////////////////////////////////////////////////////////
	// Connect and sync
	///////////////////////////////////////////////////////////////////////////
	sequelize.sync().success(function() {
		console.log("DB Connection successful!");
	});

}