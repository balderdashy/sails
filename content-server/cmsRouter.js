var _ = require('underscore'),
	controllers = {
		'home' : require('./controllers/indexController'),
		'node' : require('./controllers/nodeController'),
		'page' : require('./controllers/pageController')
	};
//	model = require('./model');



var mappings = {
	  '/node': controllers.node.index
	, '/node/:id?': controllers.node.view
	  
	, '/sitemap': controllers.page.index
	, '/page': controllers.page.index
	, '/page/:id?': controllers.page.view
	
	, '/': controllers.home.index
}

// Set up routing table
exports.mapUrls = function mapUrls (app) {
	for (var r in mappings) {
		app.get(r, mappings[r]);
	}
}
