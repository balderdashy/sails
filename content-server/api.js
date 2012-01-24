var db = require('./model').db;
var _ = require('underscore');



// Get schema+content based on context
exports.getContentSchema = function(context, callback) {
	
	// If collection is specified, grab content for given collection
	db.Content.gatherByCollection(context.collection, function (content) {

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

	// TODO: If collection is null, grab data based on context (page/layout/domain)
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
