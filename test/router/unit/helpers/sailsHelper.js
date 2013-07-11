/**
 * Module dependencies
 */
var Sails = require('../../../../lib/app');

module.exports = {
	
	build: function (cb) {
		var sails = new Sails();
		sails.load(function (err) {
			cb(err,sails);
		});
	},

	teardown: function (sails, cb) {
		sails.lower(cb);
	}
};