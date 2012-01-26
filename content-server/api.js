var db = require('./model').db;
var _ = require('underscore');



// Get schema+content based on context
exports.getContentSchema = function(context, callback) {
	var collection = context.param;
	
	// If collection is specified, grab content for given collection
	if (collection) {
		db.Content.gatherByCollection(collection, function (content) {
			
			console.log("\n\nDB RESPONDED:",content)

			// Process database response into simple map
			var contentSchema = {};
			_.each(content,function(it) {
				contentSchema[it.title] = it.payload
			});

			// Respond with content schema map
			callback && callback({
				success: true,
				context: context,
				content: contentSchema
			});
		});
	}
	else {
		// Otherwise, use as much settings/cache/page/layout data as possible
		// to determine the minimum amount of data to fetch
		db.Content.gatherAll(context, function (content) {

			// Process database response into simple map
			var contentSchema = {};
			_.each(content,function(it) {
				contentSchema[it.title] = it.payload
			});

			// Respond with content schema map
			callback && callback({
				success: true,
				context: context,
				content: contentSchema
			});
		});
	}
}


exports.getNode = function(context,callback) {
	var nodeName = context.param;
	db.Content.get(nodeName, function (content) {
			
			console.log("\n\nDB RESPONDED:",nodeName,content)

			// Respond with content
			callback && callback({
				success: true,
				context: content.title,
				content: content.payload
			});
		});
}



// Beam data back to CRUDclient
exports.respond = function (content,req,res) {
	var jsonpCallback=req.query && req.query.callback;
	if (jsonpCallback) {
		res.contentType('text/javascript');
		res.send(jsonpCallback + '(' + JSON.stringify(content) + ')');
	}
	else {
		res.json(content);
	}
}
