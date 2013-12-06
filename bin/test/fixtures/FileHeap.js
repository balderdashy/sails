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
		_outputPath = './.tmp/',
		_files = [];


	this.errors = {
		unknown: function (pathToNewFile) {
			return new Error('Unknown file :: '+pathToNewFile);
		}
	};


	/**
	 * Get new pathToNewFile and reserve it
	 */
	this.alloc = function () {

		// Find a new file, checking if any existing files exist
		// Increase incrementor exponentially to minimize alloc time
		// TODO: optimize if necessary
		var pathToNewFile,
			exponentialIterator = 1;
		do {
			_aid += exponentialIterator;
			exponentialIterator *= 2;
			pathToNewFile = _outputPath + _aid + _suffix;
		}
		while ( fs.existsSync(pathToNewFile) );

		_files.push(pathToNewFile);
		return pathToNewFile;
	};


	/**
	 * Write some dummy bytes to a new file with the specified path
	 * @param {String} pathToNewFile
	 * @param {Function} cb
	 */
	this.touch = function (pathToNewFile, cb) {
		if ( !this.contains(pathToNewFile) ) {
			return cb(this.errors.unknown(pathToNewFile));
		}

		fs.outputFile(pathToNewFile, 'blah blah', cb);
	};



	/**
	 * Delete all generated files
	 * @param {Function} cb
	 */
	this.cleanAll = function (cb) {
		async.each(_files, function (path, cb) {
			fs.remove(path, cb);
		}, cb);
	};



	/**
	 * @param {String} pathToNewFile
	 * @param {Function} cb
	 *		@param {Error} err
	 *		@param {String} contents of file
	 */
	this.read = function (pathToNewFile, cb) {
		if ( !this.contains(pathToNewFile) ) {
			return cb(this.errors.unknown(pathToNewFile));
		}
		fs.readFile(pathToNewFile, cb);
	};
	this.readSync = function (pathToNewFile) {
		if ( !this.contains(pathToNewFile) ) {
			return cb(this.errors.unknown(pathToNewFile));
		}
		return fs.readFileSync(pathToNewFile);
	};



	/**
	 * @param {String} pathToNewFile
	 * @returns whether the pathToNewFile has been allocated
	 */
	this.contains = function (pathToNewFile) {
		return _.contains(_files,pathToNewFile);
	};

};
