/**
 * Module dependencies
 */
var Grunt = require('../lib/hooks/grunt');

/**
 * `sails run`
 *
 * Issue a command/instruction
 */
module.exports = function() {
	var log = this.logger;
	var sailsOptions = this.baseOptions;

	// Run a grunt task.
	// Grunt = Grunt(sails);
	// Grunt.runTask(taskName, cb);

	log.error('Sorry, `sails run` is currently out of commission.');
	process.exit(1);
};
