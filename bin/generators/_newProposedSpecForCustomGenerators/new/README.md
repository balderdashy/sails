
## Usage

To use generators programmatically:

```javascript

// Usage
var generate = require('sails-generate');
var GeneratorDef = require('sails-generate-new');
generate(GeneratorDef, {
	success: function () {},
	error: function () {},
	invalid: function () {},
});

```


<!--
// in dependencies:

	// (TODO: handle providing these internally)
	// 'folder'		: require('root-require')('base/folder'),
	// 'template'		: require('root-require')('base/template'),
	// 'jsonfile'		: require('root-require')('base/jsonfile'),


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

-->