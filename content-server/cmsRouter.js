var _ = require('underscore');

var routes = {
	
	'index':{},
	
	'page':{
		title: 'Edit Pages | crud.io'
	},
	
	'node':{
		title: 'Edit Content | crud.io'
	}
	
}

var mappings = {
	  '/node': 'node'
	, '/page': 'page'
	, '/sitemap': 'page'
	, '/*': 'index'
}



// Set up routing table
exports.mapUrls = function mapUrls (app) {
	for (var r in mappings) {
		app.get(r, renderView(mappings[r]));
	}
}

function renderView(view) {
	return function (req, res, next ){
		// use default title if none was specified
		if (routes[view] && ! routes[view].title) {
			routes[view].title = "crud.io";
		}
		
        res.render(view, routes[view]);
    }
}