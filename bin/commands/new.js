/**
 * `sails new`
 *
 * Create all the files/folders for a new app at the specified path.
 * Relative and/or absolute paths are ok!
 *
 * Asset auto-"linker" is enabled by default.
 * 
 * @param  {Object} options [description]
 */
module.exports = function ( options ) {
	var log = this.logger;
	var sailsOptions = this.baseOptions;

	var GeneratorFactory = require('./generators/factory');
	var generate = GeneratorFactory( 'new' );

	generate( options, {
		error: function(err) {
			log.error(err);
			return;
		},
		success: function() {
			log('Created a new app `' + options.appName + '` at ' + options.appPath + '.');
			return;
		},
		missingAppName: function () {
			log.error('Please choose the name or destination path for your new app.');
			return;
		}
	});
};
