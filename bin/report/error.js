/**
 * Sails CLI internal error occurred.
 *
 * Print error message.
 */
module.exports = function ( err ) {
	var log = this.logger;
	var sailsOptions = this.baseOptions;

	// log.error( 'An error occurred.' );
	log.error( err );
	console.log('');
};
