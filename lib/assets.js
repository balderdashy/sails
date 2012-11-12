var rigging = require('rigging');

exports.css = function() {
	var html = '';

	if(config.environment === 'production') {
		// In production mode, use minified version built ahead of time
		html+='<link rel="stylesheet" type="text/css" media="all" href="/rigging.min.css"/>';
	}
	else {
		// In development mode, lookup css files in the rigging dir(s) on the fly
		_.each(rigging.ls(config.riggingPath,/\.css$/,true),function(path) {
			html+='<link rel="stylesheet" type="text/css" media="all" href="/'+path+'"/>';
		});
	}

	return html;
};


exports.js = function() {
	var html = '';

	// TODO: bundle and automatically include socket.io.js in the public directory
	html += '<script type="text/javascript" src="/socket.io/socket.io.js"></script>';

	if(config.environment === 'production') {
		// In production mode, use minified version built ahead of time
		html += '<script type="text/javascript" src="/rigging.min.js"></script>';
	}
	else {

		// In development mode, lookup css files in the rigging dir(s) on the fly
		_.each(rigging.ls(config.riggingPath,/\.js$/,true),function(path) {
			html+='<script type="text/javascript" src="/'+path+'"></script>';
		});
	}

	return html;
};


// TODO: build templates into one file for production mode
exports.templateLibrary = function() {
	var html = '<div style="display:none;" id="mast-template-library">\n';

	// Get all template files in rigging path
	var files = rigging.ls(config.riggingPath,/\.ejs$/);
	_.each(files,function(filepath) {
		html += fs.readFileSync(filepath,'utf8') + "\n";
	});

	html+="</div>";
	return html;
};