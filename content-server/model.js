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
	}, {
		classMethods: {
			gatherByCollection: function(collection,callback){
				var results = Content.findAll();
				console.log("RESULTS:",results);
				console.log("CALLBACK:",callback);
				results.success(callback);
			}
		}
	})

var Collection = exports.db.Collection = sequelize.define('Collection', {
	title: Sequelize.STRING,
	description: Sequelize.TEXT
})

// Build associations
Collection.hasMany(Content);
	Content.hasMany(Collection);

	// Synchronize models with database
	sequelize.sync().success(function() {
		console.log("DB Connection successful!");
	});

}