/**
 * Module depencencies
 */
var checksum = require('checksum');
var fs = require('fs-extra');




module.exports = {

	//
	// TODO: use lstat instead of readdir and readFile 
	// for these existence checks.
	// (low priority- just makes tests run faster)
	// 



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
	fileDoesntExist: function (cb) {
		fs.readFile(this.options.pathToNew, function (err) {
			if (err && err.code === 'ENOENT') {
				return cb();
			}
			else if (err) return cb(err);
			else return cb(new Error('File should not exist.'));
		});
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
	 * @this {Object} options
	 */
	dirDoesntExist: function (cb) {
		fs.readdir(this.options.pathToNew, function (err) {
			if (err && err.code === 'ENOENT') {
				return cb();
			}
			else if (err) return cb(err);
			else return cb(new Error('Directory should not exist.'));
		});
	},



	/**
	 * @param {Function} cb
	 *
	 * @this {Object} options
	 */
	fileIsExactly: function (compareStr) {
		return function (cb) {
			fs.readFile(this.options.pathToNew, function (err, contents) {
				if (err) return cb(err);
				return cb(null, checksum(compareStr) === checksum(contents));
			});
		};
	},



	/**
	 * @param {Function} cb
	 *
	 * @this {Object} options
	 */
	fileIsNot: function (compareStr) {
		return function (cb) {
			fs.readFile(this.options.pathToNew, function (err, contents) {
				if (err) return cb(err);
				return cb(null, checksum(compareStr) !== checksum(contents));
			});
		};
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
