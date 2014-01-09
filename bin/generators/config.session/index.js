/**
 * Module dependencies
 */
var generateSecret = require('../../../../../lib/hooks/session/generateSecret'),
	fs = require('fs-extra'),
	path = require('path'),
	ejs = require('ejs');


/**
 * Generate unique session secret (to write `config/session.js`)
 */
module.exports = {

	configure: function(options, sails, handlers) {
		options.pathToNew = path.resolve(options.appPath, 'config/session.js');
		options.template = path.resolve(__dirname, 'template');
		handlers.success(options);
	},


	render: function (options, cb) {
		// Read template from disk
		fs.readFile(options.template, options.templateEncoding, function gotTemplate (err, template) {
			if (err) return cb(err);

			// Create the code (generate session secret) and save it as `options.contents`.
			options.contents = ejs.render(template, {
				secret: generateSecret()
			});

			cb(null, options);
		});

	}

};
