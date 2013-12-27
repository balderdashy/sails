module.exports = function(sails) {
	

	/**
	 * Expose hook definition
	 */
	return {
		defaults: {},


		/**
		 * Initialize is fired first thing when the hook is loaded.
		 * 
		 * @param  {Function} cb
		 */
		initialize: function (cb) {

			// Expose `errors` object on `sails`.
			sails.errors = {};

			// TODO: load custom runtime errors using moduleloader
			
			cb();
		}

	};
};
