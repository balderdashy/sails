var Sequelize = require("sequelize");
var config = require("./config");


exports.db = {};
exports.sequelize = null;


exports.bootstrap = function () {
	
	// Connect to database
	var sequelize = exports.sequelize = new Sequelize(config.db.database, config.db.username,config.db.password);

	// Build models
	var Collection = exports.db.Collection = sequelize.define('Collection', {
		title: Sequelize.STRING,
		description: Sequelize.TEXT
	})


	var Content = exports.db.Content = sequelize.define('Content', {
		title: Sequelize.STRING,
		description: Sequelize.TEXT,
		payload: Sequelize.TEXT
	}, {
		classMethods: {
			gatherByCollection: function(collectionName,successCallback,errorCallback){
				console.log("Gathering by collection.",collectionName);
				
				// Get collection
				Collection.findAll({
					where: {
						title: collectionName
					}
				}).on('success',function (collection){

					// Get the associated list of content nodes
					if (collection && collection[0]) {
						collection[0].getContents().on('success',successCallback);
					}
					else {
						errorCallback('No collection with that name exists.');
					}
				});
			},
			
			// TODO: support settings, page, and layout cues
			gatherByContext: function(context,successCallback,errorCallback) {
				console.log("Gathering by context.");
				var results = Content.findAll();
				results.on('success',successCallback);
			},
			
			// Get a specific content node
			get: function (nodeName, successCallback,errorCallback) {
				console.log("Getting specific node.");
				var results = Content.find({
					where: {
						title: nodeName
					}
				});
				results.on('success',successCallback);
			}
		}
	});

	// Build associations
	Collection.hasMany(Content);
	Content.hasMany(Collection);

	// Synchronize models with database
	sequelize.sync().success(function() {
		console.log("DB Connection successful!");
	});

}