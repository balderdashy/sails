module.exports = {

	configure: function(options, sails, handlers) {

		options.templateFilePath = require('path').resolve(__dirname, 'gitignore.template');
		options.pathToNew = require('path').resolve(options.appPath, '.gitignore');

		return handlers.success(options);

	}

};