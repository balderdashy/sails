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
			gatherByCollection: function(collectionName,callback){
				console.log("Gathering by collection.",collectionName);

				
				// TODO: actually do the join here-- this just gets the collection, 
				//		It NEEDS to get the associated list of content nodes.
				var results = Collection.find({
					where: {
						title: collectionName
					}
				});

				results.on('success',callback);
			},
			
			// TODO: support settings, page, and layout cues
			gatherAll: function(context,callback) {
				console.log("Gathering all.");
				var results = Content.findAll();
				results.on('success',callback);
			},
			
			// Get a specific content node
			get: function (nodeName, callback) {
				console.log("Getting specific node.");
				var results = Content.find({
					where: {
						title: nodeName
					}
				});
				results.on('success',callback);
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