module.exports = function(sails) {

	/**
	 * Module dependencies
	 */
	var util			= require('sails-util');

	/**
	 * `userhooks`
	 *
	 * Sails hook for loading user plugins (hooks)
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
			sails.log.verbose('Loading user hooks...');

			// Load user hook definitions
			sails.modules.loadUserHooks(function hookDefinitionsLoaded(err, hooks) {
				if (err) return cb(err);

        // Ensure hooks is valid
        hooks = util.isObject(hooks) ? hooks : {};

        // Add the user hooks to the list of hooks to load
        util.extend(sails.hooks, hooks);

				return cb();

			});
		}
	};
};
