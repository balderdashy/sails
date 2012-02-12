var Content = exports.model = db.model.define('Content', {
		
	title: Sequelize.STRING,
		
	description: Sequelize.TEXT,
		
	type: Sequelize.TEXT,
		
	payload: Sequelize.TEXT
		
}, {
			
	associate: function () {
		Content.hasMany(Collection);
	},
		
	classMethods: {

		// Get a set of nodes that belong to a specified collection
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

		// Get a set of nodes by context
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
		},
		
		// Count a filtered list of nodes
		countFilter: function(params,successCallback,errorCallback) {
			console.log("Counting content.");
			
			// Generate WHERE clause from filter
			var whereQuery,q;
			if (params.filter) {
				q = "%" + params.filter + "%";
				whereQuery = [
					" title LIKE ? OR description LIKE ? OR payload LIKE ? ", q,q,q,
				];
			}
			else {
				whereQuery= null;
			}
			
			// Build query
			var query = {
				where: whereQuery,
				order: params.sort+' '+params.order
			};
			
			Content.count(query).on('success',successCallback);
			
		},

		// Get a paginated/filtered list of nodes
		fetchFilter: function(params,successCallback,errorCallback) {
			console.log("Fetching content.");
			
			// Generate WHERE clause from filter
			var whereQuery,q;
			if (params.filter) {
				q = "%" + params.filter + "%";
				whereQuery = [
					" title LIKE ? OR description LIKE ? OR payload LIKE ? ", q,q,q,
				];
			}
			else {
				whereQuery= null;
			}
			
			// Build query
			var query = {
				where: whereQuery,
				order: params.sort+' '+params.order,
				offset: params.offset,
				limit: params.max
			};
			
			Content.findAll(query).on('success',successCallback);
		}
	}
});
