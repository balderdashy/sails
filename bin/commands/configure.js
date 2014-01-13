module.exports = function ( options ) {
	var log = this.logger;
	var config = this.config;

	log.info('To configure the Sails command-line interface, create a `.sailsrc` file.');
	console.log();
	log.warn('The `.sailrc` specification is currently an experimental feature.');
	log.warn('Please share your feedback on Github! (http://github.com/balderdashy/sails)');
	return;
};
