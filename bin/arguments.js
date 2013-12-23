/**
 * Module dependencies
 */
var _ = require('lodash');




/**
 * Interpret and validate command-line arguments.
 * Then take the appropriate action.
 *
 * Calls one of:
 *		- handler.sails
 *		- handler.console
 *		- handler.lift
 *		- handler.generate
 *		- handler.new
 *		- handler.run
 *		- handler.version
 */

module.exports = function interpretArguments ( argv, handlers ) {

	if ( !_.isObject(argv) ) return handlers.invalid();
	if ( !_.isArray(argv._) ) return handlers.invalid();
	if ( !argv._.length ) return handlers.sails();
	
	var first	= argv._[0] || '',
		second	= argv._[1] || '',
		third	= argv._[2] || '',
		fourth	= argv._[3] || '',
		fifth	= argv._[4] || '',
		all		= _.map(argv._, function (arg) {return arg + '';});


	var isLift		= _.contains(['lift', 'raise', 'start', 'server', 's', 'l'], first),
		isConsole	= _.contains(['console', 'c'], first),
		isGenerate	= _.contains(['generate'], first),
		isNew		= _.contains(['new'], first),
		isVersion	= _.contains(['version'], first),
		isWWW		= _.contains(['www', 'build'], first),
		isRun		= _.contains(['run','issue'], first);


	// Interpret/validate arguments to `sails generate`
	if ( isGenerate ) {

		// Second argument is the type of module to generate
		var module = second;

		// Third argument is the id of the module we're creating
		var id = third;


		// If the module or id is invalid, or doesn't exist,
		// we have a usage error on our hands.
		if ( !module ) {
			return handlers.invalid(
				'What type of module would you like to generate?'
			);
		}

		var knownGenerators = [
			'controller',
			'model',
			'view',
			'api',
			'adapter',
			'policy'
		];

		// Check for unknown generators
		// (this will be removed eventually)
		if ( !_.contains(knownGenerators, module) ) {
			return handlers.error(
				'Sorry, I don\'t have a "' + second + '" generator.  ' + 
				'Did you mean: `sails generate api '+second+'`?'
			);
		}

		// Check for todo/not-yet-supported generators
		switch ( module ) {
			case 'view':
			case 'policy':
			case 'adapter':
				return handlers.error(
				'Sorry, `sails generate ' + second + '` ' +
				'is currently out of commission.');
		}


		// If no id argument exists, this is a usage error
		// TODO: support `sails generate` again
		// 		 (for creating a model AND controller at the same time)
		if ( !id ) {
			return handlers.invalid(
				'Please specify the name for the new ' + module + '.'
			);
		}
		if ( !id.match(/^[a-z]([a-z]|[0-9])*$/i) ) {
			return handlers.invalid(
				'Sorry, "' + id + '" is not a valid name for a ' + module + '.',
				'Only letters and numbers are allowed, and it must start with a letter.',
				'(Sails ' + module + 's are case-insensitive.)'
			);
		}

		// Allow cli user to specify `FooController` and really mean `foo`
		if (module === 'controller') {
			id = id.replace(/Controller$/, '');
		}


		// Figure out whether subsequent cmdline args are
		// supposed to be controller actions or model attributes.
		var arrayOfArgs = argv._.splice(3);
		var argsLookLikeAttributes = ( arrayOfArgs[0] && arrayOfArgs[0].match(/:/) );

		// If module === 'model', args ALWAYS "lookLikeAttributes"
		if ( module==='model' ) { argsLookLikeAttributes = true; }

		var actions = argsLookLikeAttributes ? [] : arrayOfArgs;
		var attributes = argsLookLikeAttributes ? arrayOfArgs : [];


		// Build options
		var options = _.extend({}, argv, {
			id: id,
			module: second,
			actions:  actions,
			attributes: attributes
		});

		handlers.generate(options);
		return;
	}




	/**
	 * `sails new <APPNAME>`
	 *
	 * Asset auto-"linker" is enabled by default
	 */
	if ( isNew ) {

		var linkerExplicitlyDisabled = (argv['linker'] === false) || (argv['linker'] === 'false');

		handlers['new']({
			appName: second,
			assetLinker: {
				enabled: linkerExplicitlyDisabled ? false : true,
				src: argv['linker-src'] || 'assets/linker/**/*'
			},
			dry : argv.dry
		});
		return;
	}





	if ( isLift )		return handlers.lift();
	if ( isConsole )	return handlers.console();
	if ( isVersion )	return handlers.version();
	if ( isRun )		return handlers.run();
	if ( isWWW )		return handlers.www();


	// Unknown action
	return handlers.invalid( { first: first } );
};
