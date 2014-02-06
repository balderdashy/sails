/**
 * Squirt the firehose.
 */

module.exports = function (sails) {

	return function publishToFirehose ( data ) {
		sails.sockets.broadcast('sails_firehose', sails.sockets.DEFAULT_EVENT_NAME, data);
	};

};
