/**
 * `sails console`
 *
 * Enter the interactive console (aka REPL) for the app
 * in our working directory.
 */

module.exports = function() {
	var log = this.logger;
	var config = this.config;

	// Load up sails just to get the version
	var sails0 = new Sails();
	sails0.load(_.merge({}, config, {
		hooks: false,
		globals: false
	}), function(err) {
		if (err) return Err.fatal.failedToLoadSails(err);

		var appID = _.str.capitalize(path.basename(process.cwd())),
			appName = _.str.capitalize(appID);

		console.log();
		log('Welcome to the Sails console (v' + sails0.version + ')');
		log('( to exit, type <CTRL>+<C> )');
		log.verbose('Lifting `' + process.cwd() + '` in interactive mode...');

		// Now load up sails for real
		var sails = new Sails();
		sails.lift(_.merge({},
			config, {

				// Disable ASCII ship to keep from dirtying things up
				log: {
					noShip: true
				}
			}), function(err) {
			if (err) return Err.fatal.failedToLoadSails(err);

			var repl = REPL.start('sails> ');
			repl.on('exit', function(err) {
				if (err) {
					log.error(err);
					process.exit(1);
				}
				process.exit(0);
			});

		});
	});
};