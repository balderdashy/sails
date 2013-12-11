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

	// Defaults
	// NOTE: Some of these options aren't actually used by this helper.
	// They are simply sane defaults for the generator to use.
	options = _.defaults(options, {
		templateEncoding: 'utf8',
		ext: 'js',
		appPath: process.cwd()
	});

	// Save reference to generator so it won't be inadvertently overridden in `options`
	var generator = options.generator;

	// Ensure this directory is a Sails app  (override with `force` option)
	if ( !Sails.isSailsAppSync( options.appPath ) && !options.force ) {
		return handlers.notSailsApp();
	}

	var sails = new Sails();
	sails.load({
		appPath: options.appPath,
		globals: false,
		loadHooks: ['userconfig', 'moduleloader']
	}, function loadedSailsConfig (err) {
		if (err) {
			// TODO: negotiate error type
			return handlers.error(err);
		}

		// Run `configure` method of configured `generator` if it exists
		// This marshals and provides defaults for our options.
		if (generator.configure) {
			generator.configure(options, sails, {
				invalid: function (errors) {
					handlers.invalid(errors);
				},
				ok: _continue_
			});
		}
		else _continue_(options);



		// After asynchronous if...
		function _continue_ (options) {

			// Ensure required options specified by the configured `generator` actually exist
			if (generator.requiredOptions) {
				var missingOpts = _.difference(generator.requiredOptions, Object.keys(options));
				if ( missingOpts.length ){
					return handlers.invalid('Missing required options for this generator :: '+missingOpts);
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
				
				GenerateFileHelper(options, {
					ok: function () {
						// Pass along options to that sub-generators can access them
						handlers.ok(options);
					},
					error: handlers.error,
					alreadyExists: handlers.alreadyExists || handlers.error
				});
				return;
			});
		}

	});
};

