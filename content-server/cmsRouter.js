var _ = require('underscore'),
	controllers = {
		'meta' : require('./controllers/MetaController'),
		'node' : require('./controllers/NodeController'),
		'page' : require('./controllers/PageController')
	};

var mappings = {
	
	  '/node': controllers.node.index
	, '/nodes': controllers.node.index
	, '/node/index': controllers.node.index
	
	, '/node/create': controllers.node.create
	, '/node/add': controllers.node.create
	, '/node/new': controllers.node.create
	
	, '/node/:id?': controllers.node.read
	, '/node/read/:id?': controllers.node.read
	, '/node/view/:id?': controllers.node.read
	, '/node/show/:id?': controllers.node.read
	, '/node/detail/:id?': controllers.node.read
	
	, '/node/edit/:id?': controllers.node.update
	, '/node/modify/:id?': controllers.node.update
	, '/node/update/:id?': controllers.node.update
	
	, '/node/delete/:id?': controllers.node.remove
	, '/node/remove/:id?': controllers.node.remove
	, '/node/destroy/:id?': controllers.node.remove
	
	, '/sitemap': controllers.page.index
	, '/page': controllers.page.index
	, '/page/:id?': controllers.page.view
	, '/page/view/:id?': controllers.page.view
	
	
	// Application meta actions
	, '/': controllers.meta.home
	, '/500': controllers.meta.error
	, '/404': controllers.meta.notfound
	
	
	
	// Handle wildcard requests
	, '/:entity/:action/:id?': function (req,res,next) {
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
				console.log("FOUUND",controller);
				
				// Try to map to a method
				if (controller[action]) {
					var method = controller[action];
					return method(req,res,next);
				}
			}
			
			// If that fails, just display the 404 page
			return res.json({
				wildcard: 'fail'
			});
				//controllers.meta.notfound(req,res,next);
		}
		else {
			next();
		}
	}
}

// Set up routing table
exports.mapUrls = function mapUrls (app) {
	for (var r in mappings) {
		app.get(r, mappings[r]);
	}
}
