var db = require('../model').db;


/**
 * Respond to read request
 */
exports.read = function(req, res){
	
	// Get context based on request
	var context = getContext(req);

	// Look up content schema for this context
	var content = getContentSchema(context);

	// Return that infomration to crud client
	respond(content,res);
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
function getContentSchema(context) {
	
	var content = {};

	return {
		success: true,
		context: context,
		content: content
	};
}

// Beam data back to CRUDclient
function respond(content,res) {
	res.contentType('application/json');
	res.send(JSON.stringify(content));
}