module.exports = function (sails) {

	/**
	 * Module dependencies
	 */
	var Grunt			= require('sails/lib/hooks/grunt')(sails);


	/**
	 * `sails www`
	 *
	 * Run the `grunt build` task
	 *
	 */

	return function (taskName, cb) {

		// Default to 'build' task
		taskName = taskName || 'build';
		
		// Fire up grunt
		Grunt.runTask(taskName, cb);
	};


};
