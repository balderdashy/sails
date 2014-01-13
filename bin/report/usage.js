/**
 * Display usage info.
 * 
 * i.e. the CLI was run with no arguments.
 * Print welcome message and usage info.
 * 
 * @return {[type]} [description]
 */
module.exports = function usage() {
	var log = this.logger;
	var sailsOptions = this.baseOptions;

	var sails = new Sails();
	sails.load( _.merge({},sailsOptions, {
		hooks: false,
		globals: false
	}), function (err) {
		if (err) return Err.fatal.failedToLoadSails(err);
		console.log('');
		log.info('Welcome to Sails! (v' + sails.version + ')');
		log.info( cliutil.usage.sails() );
		console.log('');
	});
};
