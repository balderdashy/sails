module.exports = function(sails) {
	return function(cb) {
		sails.log.verbose('Running app bootstrap...');

		// Run boostrap script if specified
		var boostrapWarningTimer;
		if (sails.config.bootstrap) {
			var boostrapDefaultTimeout = 2000;
			boostrapWarningTimer = setTimeout(function() {
				sails.log.warn("Bootstrap is taking unusually long to execute " +
					"its callback (" + boostrapDefaultTimeout + "ms).\n" +
					"Perhaps you forgot to call it?  The callback is the first argument of the function.");
			}, boostrapDefaultTimeout);
			sails.config.bootstrap(function(err) {
				boostrapWarningTimer && clearTimeout(boostrapWarningTimer);
				if (err) return cb(err);
				return cb();
			});
		}
		// Otherwise, don't
		else cb();
	};
};