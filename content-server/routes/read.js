var db = require('../model').db;
var _ = require('underscore');


/**
 * Respond to read request
 */
exports.read = function(req, res){

	// Get context based on request
	var context = getContext(req);

	// Look up content schema for this context
	getContentSchema(context, function (response){
		console.log("MADE IT!",response);

		// Return that infomration to crud client
		respond(response,res);
	});

};


// Get context based on request
function getContext(req) {
	// Grab collection from request URL and clean it up, chop off opening slash
	var collection = req.route.params.length && req.route.params[0].substr(1);
	collection = (collection=="" || !collection) ? null : collection;
	console.log("Requested: ",collection);

	// Establish context (what do we need to fetch?)
	var context = {
		domain: null, //todo
		page: null, //todo
		layout: null, //todo
		collection: collection
	};
	return context;
}

// Get schema+content based on context
function getContentSchema(context, callback) {
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
}

// Beam data back to CRUDclient
function respond(content,res) {
	res.contentType('application/json');
	res.send(JSON.stringify(content));
}