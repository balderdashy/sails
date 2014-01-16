var sailsgen = require('sails-generate');

/**
 * `sails new`
 *
 * Create all the files/folders for a new app at the specified path.
 * Relative and/or absolute paths are ok!
 *
 * Asset auto-"linker" is enabled by default.
 * 
 * @param  {Object} scope [description]
 */
module.exports = function ( scope ) {
	var log = this.logger;
	var config = this.config;

	// Look at config, determine which module to use for this generator
	// `new`
	var module = 'sails-generate-new';
	var Generator = require(module);

	sailsgen( Generator, scope, {
		error: function(err) {
			log.error(err);
			return;
		},
		success: function() {
			log('Created a new app `' + scope.appName + '` at ' + scope.appPath + '.');
			return;
		},
		missingAppName: function () {
			log.error('Please choose the name or destination path for your new app.');
			return;
		}
	});
};
