/**
 * Module Dependencies
 */
var switchback = require('node-switchback');
var _ = require('lodash');
var async = require('async');
var path = require('path');

var GenerateModuleHelper = require('root-require')('bin/generators/_helpers/module');
var GenerateFolderHelper = require('root-require')('bin/generators/_helpers/folder');
var GenerateJSONHelper = require('root-require')('bin/generators/_helpers/jsonfile');


/**
 * Generate the `assets` directory in a Sails app, toegether w/ its default contents.
 */
module.exports = {

	/**
	 * generate
	 * 
	 * @param  {Object} options
	 * @param  {Function|Switchback} sb       [switchback]
	 */
	generate: function ( options, sb ) {
		sb = switchback(sb);


		var folders = [
			'images',
			'js',
			'styles',
			'templates'
		];

		var templateFiles = [

			// assets/*
			'js/sails.io.js',
			'js/socket.io.js',
			'js/socketio_example.js'
		];

		if (! options.pathToNew) {
			options.pathToNew = path.resolve(options.appPath, 'assets');
			// console.log('OPTIONS', options);
		}
		

		if (options.dry) {
			// log.debug( 'DRY RUN');
			return sb.success('Would have created assets directory at ' + options.pathToNew + '.');
		}
		
		async.auto({

			folders: function(cb) {
				async.each(folders, function(folder, cb) {
					cb = switchback(cb);

					// Build folders
					GenerateFolderHelper({
						pathToNew: path.resolve(options.pathToNew,folder),
						gitkeep: true
					}, {
						alreadyExists: function (destinationPath) {
							return cb('A file or folder already exists at the destination path :: ' + destinationPath);
						},
						error: cb,
						success: cb.success
					});
				}, cb);
			},

			template: ['folders', function(cb) {
				async.each(templateFiles, function(fileOrGenerator, cb) {
					cb = switchback(cb);

					// Build new options set
					var opts;
					if (typeof fileOrGenerator === 'string') {

						// No custom generator exists: just copy file from template
						opts = _.extend({}/*{force: true}*/, options,{
							generator: {},
							templateFilePath: path.resolve(__dirname,'./template/' + fileOrGenerator),
							pathToNew: path.resolve(options.pathToNew, fileOrGenerator)
						});
					}
					else {

						// Use custom generator
						opts = _.extend({},/*{force: true}*/options,{
							generator: fileOrGenerator
						});
					}

					// Generate module
					GenerateModuleHelper(opts, cb);
				}, cb);
			}]
		}, sb);
	}


};
