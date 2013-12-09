/**
 * Module dependencies
 */

var Sails = require('../../../../lib/app');
var _ = require('lodash');
_.str = require('underscore.string');
var async = require('async');
var switcher = require('../../../../util/switcher');

var GenerateFileHelper = require('../file');


/**
 * Generate a Sails module
 *
 * @option {Object} generator
 *
 * @handlers ok
 * @handlers notSailsApp
 * @handlers alreadyExists
 * @handlers invalid
 * @handlers error
 */
module.exports = function ( options, handlers ) {
	handlers = switcher(handlers);
	
	// Validate required options
	var missingOpts = _.difference([
		'generator'
	], Object.keys(options));
	if ( missingOpts.length ) return handlers.invalid(missingOpts);

	// Default appPath
	options.appPath = options.appPath || process.cwd();

	// Save reference to generator so it won't be inadvertently overridden in `options`
	var generator = options.generator;

	// Ensure this directory is a Sails app  (override with `force` option)
	if ( !Sails.isSailsApp( options.appPath ) && !options.force ) {
		return handlers.notSailsApp();
	}

	var sails = new Sails();
	sails.load({
		appPath: options.appPath,
		loadHooks: ['userconfig', 'moduleloader']
	}, function loadedSailsConfig (err) {
		if (err) {
			// TODO: negotiate error type
			return handlers.error(err);
		}

		// Run `configure` method of configured `generator` if it exists
		// This marshals and provides defaults for our options.
		if (generator.configure) {
			options = generator.configure(options, sails);
		}

		// Ensure required options specified by the configured `generator` actually exist
		if (generator.requiredOpts) {
			var missingOpts = _.difference(generator.requiredOpts, Object.keys(options)).length;
			if ( missingOpts.length ){
				return handlers.invalid('Missing required options for this generator ::', missingOpts);
			}
		}

		// Use contents override if specified
		options.contents = options.contents || '';
		async.series([

			// Call out to our `generator` to render our module.
			// It will respond with a string that we can write to disk.
			function renderContents (cb) {
				if ( !generator.render ) return cb();
				else generator.render(options, function (err, _contents) {
					if (err) return cb(err);
					options.contents = options.contents || _contents || '';
					return cb();
				});
			}

		], function (err) {
			if (err) return handlers.error(err);

			// Now write the contents to disk
			GenerateFileHelper(options, {
				ok: handlers.ok,
				error: handlers.error,
				alreadyExists: handlers.alreadyExists
			});
		});

	});
};

