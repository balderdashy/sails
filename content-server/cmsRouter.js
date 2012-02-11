var _ = require('underscore'),
	controllers = {
		'index' : require('./controllers/indexController'),
		'node' : require('./controllers/nodeController'),
		'page' : require('./controllers/pageController')
	},
	model = require('./model');

//var routes = {
//	
//	'index': {
//		nodes: []
//	},
//	
//	'page':{
//		title: 'Manage Pages | crud.io'
//	},
//	
//	'node':{
//		title: 'Manage Content | crud.io',
//		nodes: []
//	}
//	
//}


var routes = {
	
	'index': controllers.index,
	'page':controllers.page,
	'node':controllers.node
}

var mappings = {
	  '/node': 'node'
	, '/node/:id?': 'node'
	  
	, '/sitemap': 'page'
	, '/page': 'page'
	, '/page/:id?': 'page'
	
	, '/': 'index'
}



// Set up routing table
exports.mapUrls = function mapUrls (app) {
	for (var r in mappings) {
//		app.get(r, renderView(mappings[r]));
		app.get(r, controllers[r]);
	}
}

//// Render a view
//function renderView(view) {
//	return function (req, res, next ){
//		// use default title if none was specified
//		if (routes[view] && ! routes[view].title) {
//			routes[view].title = "crud.io";
//		}
//		
//        res.render(view, routes[view]);
//    }
//}