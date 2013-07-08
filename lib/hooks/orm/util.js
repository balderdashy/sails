module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */
	var util	= require( '../../util' ),
		fs		= require( 'fs' );


	/**
	 * Expose utility class
	 */

	return {

		/**
		 * Resolve Adapter
		 *
		 * Will take in an adapter string from a model and either set it to the default
		 * or lookup the adapter config from the config/adapters.js file.
		 *
		 * Normalizes to an array for Waterline to support multiple adapters per model
		 */

		resolveAdapter: function(adapters) {

			// If model doesn't have an adapter defined set it to the default adapter
			if (!adapters) return [sails.config.adapters['default'].module];

			// Normalize adapter to an array
			if (!Array.isArray(adapters)) adapters = [adapters];

			// Loop through the adapters and normalize the names to actual module names
			adapters.forEach(function(adapter) {

				// If adapter is not in known adapters, just use the name
				if (!sails.config.adapters[adapter]) return;

				// If no module is defined for this adapter, just use the name
				if (!sails.config.adapters[adapter].module) return;

				// Transform the convience key to a module name
				var i = adapters.indexOf(adapter);
				adapters.splice(i, 1);
				adapters.push(sails.config.adapters[adapter].module);
			});

			return adapters;
		},




		/**
		 * Load Adapters
		 *
		 * Load any adapters not defined in Sails, ex: sails-postgresql, sails-mongo
		 * These need to be in the apps node_modules folder or an error will be thrown.
		 */

		loadAdapters: function(model) {

			// For each adapter, check if we have loaded it already
			var adapters = sails.models[model].adapter,
				adapter,
				modulePath,
				exists;

			for (var i = 0; i < adapters.length; i++) {
				adapter = adapters[i];

				// Check if adapter is already loaded
				if (sails.adapters[adapter]) return;

				// Try and load adapter from node_modules if it exists
				sails.log.verbose('Loading adapter for ' + model, '(', adapter, ')');
				modulePath = sails.config.paths.app + '/node_modules/' + adapter;
				exists = fs.existsSync(modulePath);

				// If adapter doesn't exist, log an error and exit
				if (!exists) {
					var missingAdapterError = 'To use ' + adapter + ', please run `npm install ' + adapter + '`';
					sails.log.error(missingAdapterError);
					throw new Error(missingAdapterError);
				}

				// Try and require the Module
				try {
					sails.adapters[adapter] = require(modulePath);
				} catch (err) {
					var invalidAdapterError = 'There was an error attempting to load ' + adapter + '.' +
						'\nIs this a valid Sails/Waterline adapter?';
					sails.log.error(invalidAdapterError, err);
					throw new Error(invalidAdapterError + '\n' + err);
				}
			}
		},



		/**
		 * Mixin Sails Config with Adapter Defaults
		 *
		 * Sets the adapter.config attribute to an actual config object containing the values
		 * set in the config/adapters.js file and the defaults from the adapter.
		 */

		buildAdapterConfig: function(adapterName) {

			var adapter = sails.adapters[adapterName];

			// Find the correct adapter config, this is needed because config can be a
			// short name but all adapters are normalized to their module name
			Object.keys(sails.config.adapters).forEach(function(key) {

				var adapterConfig = sails.config.adapters[key];

				// Check if this adapter has the same module name or the
				// same config key
				if (adapterConfig.module) {
					if (adapterConfig.module !== adapterName) return;
				} else {
					if (key !== adapterName) return;
				}

				// Ensure a config object is set on the adapter
				adapter.config = adapter.config || {};

				// Ensure a defaults object is set on the adapter
				adapter.defaults = adapter.defaults || {};

				util.extend(
					adapter.config,
					adapter.defaults,
					adapterConfig);

			});
		},




		/**
		 * Mixes in a model default with the adapter config
		 *
		 * Used to override an adapter's config on a per model basis
		 */

		overrideConfig: function(model) {

			var adapters = util.clone(sails.adapters);

			// If no custom config is defined return the adapters
			if (!sails.models[model].config) return adapters;

			var config = sails.models[model].config;

			sails.models[model].adapter.forEach(function(adapter) {

				// Extend adapter config
				util.extend(adapters[adapter].config, config);
			});

			return adapters;
		}
	};
};
