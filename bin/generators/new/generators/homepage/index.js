/**
 * Module dependencies
 */
var path = require('path');


/**
 * Generate default home page
 * (depends on configured view engine)
 */
module.exports = {

	/**
	 * Generate homepage.
	 * 
	 * @param  {Object} options  [description]
	 * @param  {Object} handlers [description]
	 */
	generate: function createNewApp( options, handlers ) {
		handlers.success();
	},

	configure: function(options, sails, handlers) {
		options.pathToNew = path.resolve(options.appPath, 'views/homepage.' + options.viewEngine);
		options.templateFilePath = path.resolve(__dirname, 'template');
		handlers.success(options);
	}

};
