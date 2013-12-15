module.exports = {

	configure: function (options, sails, handlers) {

		options.pathToNew = require('path').resolve(options.appPath, 'README.md');

		return handlers.success(options);

	},

	render: function ( options, cb ) {
		return cb(null,
			'# ' + options.appName + '\n' +
			' ' + '\n' +
			'a [Sails](http://sailsjs.org) application' + '\n'
		);
	}

};