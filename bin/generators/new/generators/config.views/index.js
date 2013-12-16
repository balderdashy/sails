/**
 * Module dependencies
 */
var fs = require('fs-extra'),
	_ = require('lodash'),
	path = require('path'),
	ejs = require('ejs');


/**
 * Generate config/views.js file
 * (depends on configured view engine)
 */
module.exports = {

	configure: function(options, sails, handlers) {
		options.pathToNew = path.resolve(options.appPath, 'config/views.js');
		options.template = path.resolve(__dirname, 'template');

		// Layout config is only supported when using `ejs`.
		if (options.viewEngine === 'ejs') {
			options.layout = 'layout';
		}

		handlers.success(options);
	},


	render: function (options, cb) {
		fs.readFile(options.template, options.templateEncoding, function gotTemplate (err, template) {
			if (err) return cb(err);
			options.contents = ejs.render(template, options);
			cb(null, options);
		});
	}

};
