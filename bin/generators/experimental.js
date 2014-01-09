// Proposed specification
// (cleanup)

module.exports = {

	dependencies: {

		// (TODO: handle providing these internally)
		'folder'		: require('root-require')('base/folder'),
		'template'		: require('root-require')('base/template'),
		'jsonfile'		: require('root-require')('base/jsonfile'),

		'Gruntfile'			: require('sails-generate-Gruntfile'),
		'config.session'	: require('sails-generate-config.session'),
		'config.views'		: require('sails-generate-config.views'),
		'assets'			: require('sails-generate-assetsDirectory')
	},
	
	/**
	 * Pass down scope, adding stuff as necessary
	 *
	 * @param  {Object} scope [this generator's scope]
	 */
	before: function (scope, sb) {
		
		// e.g. provide default `appPath` if necessary
		// (TODO: handle internally)
		_.defaults(scope, {
			appPath: process.cwd()
		});

		// e.g. load sails if necessary
		// (TODO: handle internally)
		if (scope.sails) return sb(null, scope);
		var sails = require('sails');
		sails.load({}, function (err) {
			if (err) return sb(err);
			return sb(null, _.defaults(scope, {sails: sails}));
		});
	},
	
	generate: {
		'.'					: { 'folder': {}},

		'package.json'		: { 'package.json': {}},

		'assets'			: { 'assetsFolder': {}},
		'api'				: { 'apiFolder': {}},

		'config'			: { 'configFolder': {}},
		// e.g. if a sub-generator was not used:
		// 'config'			: { 'folder': {}},
		// 'config/session.js'	: { 'config.session': {}},
		// 'config/views.js'	: { 'config.views': {}},
		// 'config/routes.js'	: { 'template': {}},
		// 'config/policies.js': { 'template': {}},
		// 'config/cors.js'	: { 'template': {}},
		// 'config/csrf.js'	: { 'template': {}},
		// 'config/log.js'		: { 'template': {}},
		// 'config/local.js'	: { 'template': {}},
		// 'config/i18n.js'	: { 'template': {}},
		// 'config/globals.js'	: { 'template': {}},
		// 'config/express.js'	: { 'template': {}},
		// 'config/sockets.js'	: { 'template': {}},
		// 'config/adapters.js': { 'template': {}},
		// 'config/bootstrap.js': { 'template': {}},
		// 'config/blueprints.js': { 'template': {}},


		'views'				: { 'viewsFolder': {}},
	}
};




// Usage
var generate = require('sails-generate');
var GeneratorDef = require('some-top-level-generator');
generate(GeneratorDef, {
	success: function () {},
	error: function () {},
	invalid: function () {},
});
