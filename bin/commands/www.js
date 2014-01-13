/**
 * `sails www`
 *
 * Build a www directory from the assets folder.
 * Uses the Gruntfile.
 */
module.exports = function() {
	var log = this.logger;
	var config = this.config;

	var wwwPath = path.resolve( process.cwd(), './www'),
		GRUNT_TASK_NAME = 'build';

	log.info('Compiling assets into standalone `www` directory with `grunt ' + GRUNT_TASK_NAME + '`...');

	var sails = new Sails();
	sails.load(_.merge({}, config, {
		hooks: {
			grunt: false
		},
		globals: false
	}), function sailsReady(err) {
		if (err) return Err.fatal.failedToLoadSails(err);

		var Grunt = Grunt__(sails);
		Grunt(GRUNT_TASK_NAME);

		// Bind error event
		sails.on('hook:grunt:error', function(err) {
			log.error('Error occured starting `grunt ' + GRUNT_TASK_NAME + '`');
			log.error('Please resolve any issues and try running `sails www` again.');
			process.exit(1);
		});

		// Task is not actually complete yet-- it's just been started
		// We'll bind an event listener so we know when it is
		sails.on('hook:grunt:done', function() {
			log.info();
			log.info('Created `www` directory at:');
			log.info(wwwPath);
			process.exit(0);
		});
	});
};
