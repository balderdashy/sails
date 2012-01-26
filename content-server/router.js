var api = require('./api');

/**
 * Respond with content for a context request
 * (update cache)
 */
exports.fetch = function(req, res) {

	// Get context based on request
	var context = getContext(req);

	// Look up content schema for this context
	api.getContentSchema(context, function (content){
		console.log("Answered read request.",content);

		// Return that infomration to crud client
		api.respond(content,req,res);
	});

};



/**
 * Respond to read request for a specific node
 */
exports.read = function(req, res) {

	// Get context based on request
	var context = getContext(req);

	// Look up content schema for this context
	api.getNode(context, function (content){
		console.log("Answered read request.",content);

		// Return that infomration to crud client
		api.respond(content,req,res);
	});

};



// Get context based on request
function getContext(req) {

	// Grab param from request URL path (remove opening slash)
	var param = req.route.params.length && req.route.params[0].substr(1);
	param = (param=="" || !param) ? null : param;
	console.log("Requested: ",param);

	// Establish context (what do we need to fetch?)
	var context = {
		domain: null, //todo
		page: null, //todo
		layout: null, //todo
		param: param
	};
	return context;
}