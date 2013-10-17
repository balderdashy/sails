module.exports = function(sails) {

	/**
	 * Module dependencies
	 */
	var util			= require('sails/lib/util'),
		initializeHooks	= require('../../app/loadHooks')(sails);

	/**
	 * `userhooks`
	 * 
	 * Sails hook for loading user plugins (hooks)
	 * 
	 */
	return {

		// Implicit default configuration
		// (mixed in to `sails.config`)
		defaults: {},

		initialize: function(cb) {

			if ( !sails.config.hooks.moduleloader ) {
				return cb('Cannot load user hooks without `moduleloader` hook enabled!');
			}
			
			// Wait for moduleloader
			sails.after('hook:moduleloader:loaded', function () {
				sails.log.verbose('Loading user hooks...');

				// Load user hook definitions
				sails.modules.optional({
					dirname: sails.config.paths.hooks,

					filter: /^(.+)\.(js|coffee)$/,

					// Hooks should be defined as either single files as a function
					// OR (better yet) a subfolder with an index.js file
					// (like a standard node module)
					depth: 2

				}, function hookDefinitionsLoaded(err, hooks) {
					if (err) return cb(err);
					sails.log.verbose('Located ' + Object.keys(hooks).length + ' user hook(s)...');

					// Initialize new hooks
					initializeHooks(hooks, function (err) {
						if (err) return cb(err);

						// Mix hooks into sails.hooks
						util.each(hooks, function (hook, hookID) {
							sails.hooks[hookID] = hook;
						});

						sails.log.verbose('Initialized ' + Object.keys(hooks).length + ' user hook(s)...');
						return cb();
					});

				});
			});
		}
	};
};