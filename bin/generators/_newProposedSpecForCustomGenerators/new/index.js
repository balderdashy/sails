/**
 * Module dependencies
 */
var util = require('./lib/util');
var bootstrap = require('./lib/bootstrap');


/**
 * sails-generate-new
 * 
 * New proposed generator specification
 * 
 * @type {Generator}
 */
module.exports = {

	/**
	 * Bootstrap and validate this generator's scope.
	 * @type {[type]}
	 */
	boostrap: bootstrap,


	/**
	 * Use the scope to figure out which flavor of each of our subgenerator dependencies to require.
	 * @type {Object}
	 */
	dependencies: {
		'gruntfile' : {
			modules		: 'sails-generate-gruntfile-*',
			enabled		: 'simple'
		},
		'view' : {
			modules		: 'sails-generate-view-*',
			enabled		: function defaultViewGeneratorSuffix (scope) { return scope.sails.config.views.engine || 'ejs'; }
		},
		'config.session': 'sails-generate-config.session',
		'config.views': 'sails-generate-config.views',
		'assets' : {
			modules		: 'sails-generate-assetsDirectory-*',
			enabled		: 'linker'
		}
	},

	/**
	 * File(s)/folder(s) to generate, generators+params to user
	 * @type {Object}
	 */
	generate: {
		'.'					: { 'folder': {}},
		'Gruntfile'			: { 'gruntfile': {}},

		'package.json'		: { 'jsonfile': { data: util.buildPackageJSON }},

		'assets'			: { 'assetsFolder': {}},
		'api'				: { 'apiFolder': {}},

		'config'			: { 'configFolder': {}},


		'views'				: { 'viewsFolder': {}},
	}
};

