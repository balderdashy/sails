/**
 * Module dependencies
 */
var Grunt			= require('sails/lib/hooks/grunt');


/**
 * `sails www`
 *
 * Run the `grunt build` task
 *
 */

module.exports = function (taskName, cb) {

	// Default to 'build' task
	taskName = taskName || 'build';
	
	var log = this.log;
	log.info('Building assets into directory...');
	
	// Fire up grunt
	var grunt = Grunt(this);
	grunt(taskName, function (err) {
		if (err) return cb && cb(err);

		log.info('Successfully built \'www\' directory in the application root.');
		cb && cb();
	});
};