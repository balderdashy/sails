module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var util	= require('../util'),
		async	= require('async');


	return function bindTeardownEvents () {
		process.on('SIGINT', function() {
			sails.lower(process.exit);
		});
		process.on('SIGTERM', function() {
			sails.lower(process.exit);
		});
		process.on('exit', function() {
			if (!sails._exiting) sails.lower();
		});
	};

};
