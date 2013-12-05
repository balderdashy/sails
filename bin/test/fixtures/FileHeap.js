/**
 * Module dependencies
 */
var fs = require('fs-extra'),
	async = require('async'),
	_ = require('lodash');


/**
 * Helper to manage/cleanup files created during test runs
 */
module.exports = function FileHeap () {

	var _aid = 0,
		_suffix = '.test',
		_outputPath = './',
		_files = [];


	/**
	 * Get new filename and reserve it
	 */
	this.alloc = function () {
		var filename = _aid + _suffix;
		_files.push(_outputPath + filename);
		_aid++;
		return filename;
	};


	/**
	 * Delete all generated files
	 */
	this.cleanAll = function (cb) {
		async.each(_files, function (path, cb) {
			fs.delete(path, cb);
		}, cb);
	};


	/**
	 * @param {String} filename
	 * @returns contents of file
	 */
	this.read = function (filename, cb) {
		if ( !this.contains(filename) ) {
			return cb('Unknown file ::', filename);
		}
		fs.readFile(_outputPath + filename, cb);
	};
	// this.readSync = function (filename) {
	// 	if ( !this.contains(filename) ) {
	// 		throw new Error('Unknown file ::', filename);
	// 	}
	// 	return fs.readFileSync(_outputPath + filename);
	// };


	this.contains = function (filename) {
		return _.contains(_files,_outputPath + filename);
	};

	this.getPath = function (filename) {
		return _.find(_files, _outputPath + filename);
	};

};
