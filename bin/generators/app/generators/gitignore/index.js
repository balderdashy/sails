module.exports = {

	configure: function(options, sails, handlers) {

		options.templateFilePath = require('path').resolve(__dirname, 'gitignore.js');
		options.pathToNew = require('path').resolve(options.appPath, '.gitignore');

		return handlers.success(options);

	}

};