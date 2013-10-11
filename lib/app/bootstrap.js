module.exports = function(sails) {
	var timeoutMs = sails.config.bootstrapTimeout || 2000;

	return function runBootstrap (cb) {

		// Run boostrap script if specified
		var timer;
		if (sails.config.bootstrap) {
			sails.log.verbose('Running the setup logic in `sails.config.bootstrap(cb)`...');
			timer = setTimeout(bootstrapTookTooLong, timeoutMs);
			sails.config.bootstrap(function bootstrapDone (err) {
				clearTimeout(timer);
				return cb(err);
			});
		}

		// Otherwise, do nothing and continue
		else cb();
	};


	/**
	 * Display warning message
	 * (just in case user forgot to call their bootstrap's `cb`)
	 */
	function bootstrapTookTooLong () {
		sails.log.warn("Bootstrap is taking unusually long to execute " +
			"its callback (" + timeoutMs + "ms).\n" +
			"Perhaps you forgot to call it?  The callback is the first argument of the function, `cb`.");
	}
};