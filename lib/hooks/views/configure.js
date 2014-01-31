/**
 * Module dependencies
 */

var _ = require('lodash')
	,	path		= require('path')
	,	util		= require('util')
	,	consolidate		= require('./consolidate');


/**
 * Marshal relevant parts of sails global configuration,
 * issue deprecation notices, etc.
 * 
 * @param  {Sails} sails
 */

module.exports = function configure ( sails ) {

	if (sails.config.viewEngine) {
		sails.log.warn('The `config.viewEngine` config has been deprecated in favor of `config.views.engine`.');
		sails.log.warn('It has been automatically migrated, but you\'ll continue to see this warning until you change your configuration files.');
		sails.config.views.engine = sails.config.viewEngine;
	}

	// Normalize view engine config
	if (typeof sails.config.views.engine === 'string') {
		var viewExt = sails.config.views.engine;
		sails.config.views.engine = {
			ext: viewExt
		};
	}

	// Ensure valid config
	if (! (sails.config.views.engine && sails.config.views.engine.ext) ) {
		sails.log.error('Invalid view engine configuration. `config.views.engine` should');
		sails.log.error('be set to either a `string` or an `object` with the following properties:');
		sails.log.error('    {');
		sails.log.error('        ext: <string>,   // the file extension');
		sails.log.error('        fn: <function>   // the template engine render function');
		sails.log.error('    }');
		sails.log.error('For example: {ext:"html", fn: require("consolidate").swig}');
		sails.log.error('For details: http://expressjs.com/api.html#app.engine');
		throw new Error('Invalid view engine configuration.');
	}

	// Try to load view module if a function wasn't specified directly
	if ( !sails.config.views.engine.fn ) {

		var appDependenciesPath;
		var fn;

		appDependenciesPath = path.join(
			sails.config.appPath,
			'node_modules'
		);

		try {
			fn = consolidate(appDependenciesPath)[sails.config.views.engine.ext];

			if ( !_.isFunction(fn) ) {
				sails.log.error(util.format('Invalid view engine (%s)-- are you sure it supports `consolidate`?', sails.config.views.engine.ext));
				throw new Error();
			}
		}
		catch (e) {
			sails.log.error('Your configured server-side view engine (' + sails.config.views.engine.ext + ') could not be found.');
			sails.log.error('Usually, this just means you need to install a dependency.');
			sails.log.error('To install ' + sails.config.views.engine.ext + ', run:  `npm install ' + sails.config.views.engine.ext + ' --save`');
			sails.log.error('Otherwise, please change your `engine` configuration in config/views.js.');
			throw e;
		}

		// Save reference to view rendering function
		sails.config.views.engine.fn = fn;
		sails.log.silly('Configured view engine, `' + sails.config.views.engine.ext + '`');
	}


	// Let user know that a leading . is not required in the viewEngine option and then fix it
	if (sails.config.views.engine.ext[0] === '.') {
		sails.log.warn('A leading `.` is not required in the views.engine option.  Removing it for you...');
		sails.config.views.engine.ext = sails.config.views.engine.ext.substr(1);
	}

	// Custom layout location
	// (if string specified, it's used as the relative path from the views folder)
	// (if not string, but truthy, relative path from views folder defaults to ./layout.*)
	// (if falsy, don't use layout)
	if ( !_.isString(sails.config.views.layout) && sails.config.views.layout ) {
		sails.config.views.layout = 'layout.' + sails.config.views.engine.ext;
	}

	if ( sails.config.views.engine.ext !== 'ejs' &&
		sails.config.views.layout ) {
		sails.log.warn('Sails\' built-in layout support only works with the `ejs` view engine.');
		sails.log.warn('You\'re using `'+ sails.config.views.engine.ext +'`.');
		sails.log.warn('Ignoring `sails.config.views.layout`...');
	}
};
