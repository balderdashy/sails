var rigging = require('rigging');

/**
* Recompile all LESS and SASS assets, then generate link tags for CSS files
* Either one minified file (in production), or a link to each individual file (in development)
*/
exports.css = function(cb) {
	var html = '';

	if(sails.config.environment === 'production') {
		// In production mode, use minified version built ahead of time
		html+='<link rel="stylesheet" type="text/css" media="all" href="/rigging_production/rigging.min.css"/>';
	}
	else {
		// In development mode, lookup css files on the rigging path on the fly
		var cssFiles = rigging.ls(sails.config.rigging.sequence,/\.css$/,true);

		// Add LESS and SASS files (these were compiled in res.view)
		cssFiles.push("rigging.less.css");
		cssFiles.push("rigging.sass.css");

		_.each(cssFiles,function(path) {
			html+='<link rel="stylesheet" type="text/css" media="all" href="/rigging_static/'+path+'"/>';
		});
	}

	return html;
};

/**
* Recompile all coffeescript assets, then generate script tags for js files
* Either one minified file (in production), or a link to each individual file (in development)
*/
exports.js = function(cb) {
	var html = '';

	if(sails.config.environment === 'production') {
		// In production mode, use minified version built ahead of time
		html += '<script type="text/javascript" src="/rigging_production/rigging.min.js"></script>';
	}
	else {
		// In development mode, lookup css files in the rigging dir(s) on the fly
		var jsFiles = rigging.ls(sails.config.rigging.sequence,/\.js$/,true);

		// Add CoffeeScript file (this was compiled in res.view)
		jsFiles.push("rigging.coffee.js");

		_.each(jsFiles,function(path) {
			html+='<script type="text/javascript" src="/rigging_static/'+path+'"></script>';
		});
	}
	return html;
};


/**
* Write templates to the template library div.
*
	* TODO: In lieu of a true cache, store the compiled templates in memory in production mode.
	* (Because templates are dumped directly into the layout, we cannot use standard HTTP or file caching methods.)
*/
exports.templateLibrary = function(cb) {
	var html = '<div style="display:none;" id="mast-template-library">\n';

	// Get all template files in rigging sequence
	var templateFiles = rigging.ls(sails.config.rigging.sequence,/\.ejs$/);
	_.each(templateFiles,function(filepath) {
		html += fs.readFileSync(filepath,'utf8') + "\n";
	});

	html+="</div>";
	return html;
};