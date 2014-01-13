/**
 * Sails CLI internal error occurred.
 *
 * Print error message.
 */
module.exports = function ( err ) {
	var log = this.logger;
	var config = this.config;

	// log.error( 'An error occurred.' );
	log.error( err );
	console.log('');
};
