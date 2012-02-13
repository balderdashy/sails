var _ = require('underscore'),
	controllers = {
		'meta' : require('./controllers/MetaController'),
		'node' : require('./controllers/NodeController'),
		'page' : require('./controllers/PageController')
	};

var mappings = {
	  '/nodes': controllers.node.index
	
	, '/sitemap': controllers.page.index
	
	, '/': controllers.meta.home
	, '/500': controllers.meta.error
	, '/404': controllers.meta.notfound
	, '/:entity/:action?/:id?': handleWildcardRequest
}

// Set up routing table
exports.mapUrls = function mapUrls (app) {
	for (var r in mappings) {
		app.get(r, mappings[r]);
	}
}

/**
 * Try to match up an arbitrary request with a controller and action
 */
function handleWildcardRequest (req,res,next) {
	var entity = req.param('entity'),
		action = req.param('action');

	if (entity && 
		entity != "stylesheets" && 
		entity != "lib" && 
		entity != "sources" && 
		entity != "images") {

		// Try to map to an entity
		if (_.contains(_.keys(controllers),entity)) {
			var controller = controllers[entity];

			// Resolve to index if action is undefined
			action = action || "index";

			// Try to map to a method
			if (! controller[action]) {
				// Resolve to an appropriate, conventional synonym
				action = 
					(action == "delete") ? "remove" :
					(action == "destroy") ? "remove" : 

					(action == "edit") ? "update" : 
					(action == "modify") ? "update" : 

					(action == "view") ? "read" : 
					(action == "show") ? "read" : 
					(action == "detail") ? "read" : 

					(action == "add") ? "create" : 
					(action == "new") ? "create" : 
					action;					
				
				// Attempt to parse id and resolve to read request
				if (!_.isNaN(+action)) {
					req.params.id = +action;
					action = "read";
				}
				
				// Pass corrected action down
				req.params.action = action;
			}

			if (controller[action]) {
				var method = controller[action];
				return method(req,res,next);
			}
		}

		// If that fails, just display the 404 page
		return controllers.meta.notfound(req,res,next);
	}
	else {
		next();
	}
}