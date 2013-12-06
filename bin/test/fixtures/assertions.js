/**
 * Module depencencies
 */
var checksum = require('checksum');
var fs = require('fs-extra');




module.exports = {

	/**
	 * @this {Object} options
	 */
	fileExists: function (cb) {
		fs.readFile(this.options.pathToNewFile, cb);
	},

	/**
	 * @this {Object} templates
	 * @this {Object} options
	 */
	fileChecksumMatchesTemplate: function (cb) {
		var templateChecksum = this.templates.file.checksum;
		fs.readFile(this.options.pathToNewFile, function (err, contents) {
			if (err) return cb(err);
			return cb(null, templateChecksum === checksum(contents));
		});
	}
};
