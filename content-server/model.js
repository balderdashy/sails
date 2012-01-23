var Sequelize = require("sequelize");
var config = require("./config");


exports.db = {};
exports.sequelize = null;


exports.bootstrap = function () {
	
	// Connect to database
	var sequelize = exports.sequelize = new Sequelize(config.db.database, config.db.username,config.db.password);

	// Build models
	var Content = exports.db.Content = sequelize.define('Content', {
	  title: Sequelize.STRING,
	  description: Sequelize.TEXT,
	  payload: Sequelize.TEXT
	})

	var Collection = exports.db.Collection = sequelize.define('Collection', {
	  title: Sequelize.STRING,
	  description: Sequelize.TEXT
	})

	// Build associations
	Collection.hasMany(Content);
	Content.hasMany(Collection);

	// Synchronize models with database
	sequelize.sync();

}