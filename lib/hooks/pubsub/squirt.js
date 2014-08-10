/**
 * Squirt the firehose.
 */

module.exports = function (sails) {

	return function publishToFirehose ( data ) {
    if (sails.config.environment == 'development') {
		  sails.sockets.broadcast('sails_firehose', 'firehose', data);
    }
	};

};
