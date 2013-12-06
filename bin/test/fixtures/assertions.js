/**
 * Module depencencies
 */
var checksum = require('checksum');
var fs = require('fs-extra');




module.exports = {

	/**
	 * @param {Function} cb
	 *
	 * @this {Object} options
	 */
	fileExists: function (cb) {
		fs.readFile(this.options.pathToNew, cb);
	},



	/**
	 * @param {Function} cb
	 *
	 * @this {Object} options
	 */
	dirExists: function (cb) {
		fs.readdir(this.options.pathToNew, cb);
	},



	/**
	 * @param {Function} cb
	 *
	 * @this {Object} templates
	 * @this {Object} options
	 */
	fileChecksumMatchesTemplate: function (cb) {
		var templateChecksum = this.templates.file.checksum;
		fs.readFile(this.options.pathToNew, function (err, contents) {
			if (err) return cb(err);
			return cb(null, templateChecksum === checksum(contents));
		});
	}
};
