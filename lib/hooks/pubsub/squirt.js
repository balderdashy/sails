/**
 * Squirt the firehose.
 */

module.exports = function (sails) {

	return function publishToFirehose ( data ) {
		sails.sockets.broadcast('sails_firehose', 'firehose', data);
	};

};
