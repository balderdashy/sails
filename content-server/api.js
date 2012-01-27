var db = require('./model').db;
var _ = require('underscore');



// Get schema+content based on context
exports.getContentSchema = function(context, callback) {
	// Interpret request parameters in context
	context.collection = context.param;
	delete context.param;
	
	// If collection is specified, grab content for given collection
	if (context.collection) {
		db.Content.gatherByCollection(
			context.collection,
			function successCallback (content) {
				// Process database response into simple map
				var contentSchema = {};
				_.each(content,function(it) {
					contentSchema[it.title] = {
						type:		it.type,
						payload:	it.payload
					}
				});

				// Respond with content schema map
				callback && callback(success(context,contentSchema));
			},
			function errorCallback (msg) {
				callback && callback(error(msg));
			}
		);
	}
	else {
		// TODO:
		// Otherwise, use as much settings/cache/page/layout data as possible
		// to determine the minimum amount of data to fetch
		db.Content.gatherByContext(
			context,
			function successCallback(content) {

				// Process database response into simple map
				var contentSchema = {};
				_.each(content,function(it) {
					console.log("****************");
					console.log(it);
					console.log("****************");
					contentSchema[it.title] = {
						type:		it.type,
						payload:	it.payload
					}
				});

				// Respond with content schema map
				callback && callback(success(context,contentSchema));
			},
			function errorCallback (msg) {
				callback && callback(error(msg));
			}
		);
	}
}




/**
 * Respond to read request for a specific node
 */
exports.getNode = function(context,callback) {
	// Interpret request parameters in context
	var nodeName = context.param;
	delete context.param;

	if (!nodeName) {
		callback && callback(error('No node specified.'));
	}
	else {
		db.Content.get(
			nodeName,
			function successCallback (node) {
				if (!node || !node.title) {
					callback && callback(error('No node by that name exists.'));
				}
				else {
					// Respond with content
					var content = {};
					content[node.title] = {
						type:		node.type,
						payload:	node.payload
					}

					callback && callback(success(context,content));
				}
			},
			function errorCallback (msg) {
				callback && callback(error(msg));
			}
		);
	}
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





// Get context based on request
exports.getContext = function (req) {

	// Grab param from request URL path (remove opening slash)
	var param = req.route.params.length && req.route.params[0].substr(1);
	param = (param=="" || !param) ? null : param;

	// Establish context (what do we need to fetch?)
	var context = {
		domain: null, //todo
		page: null, //todo
		layout: null, //todo
		param: param
	};
	return context;
}









/**
 * Returns a callback object representing the specified application context
 * with the requested content and a success message
 */
function success(context,content) {
	return {
		success: true,
		context: context,
		content: content
	}
}


/**
 * Returns a callback object with an error containing the specified message
 */
function error(msg) {
	return {
		success: false,
		error: {
			message: msg
		}
	}
}