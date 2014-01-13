/**
 * `sails version`
 *
 * Output the version of the Sails in our working directory-
 * i.e. usually, the version we installed with `npm install sails`
 *
 * If no local installation of Sails exists, display the version
 * of the Sails currently running this CLI code- (that's me!)
 * i.e. usually, the version we installed with `sudo npm install -g sails`
 */
module.exports = function() {
	var log = this.logger;
	var sailsOptions = this.baseOptions;

	var sails = new Sails();
	sails.load(_.merge({}, sailsOptions, {
		hooks: false,
		globals: false
	}), function(err) {
		if (err) return Err.fatal.failedToLoadSails(err);
		log.info('v' + sails.version);
	});
};
