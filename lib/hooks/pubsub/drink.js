/**
 * Drink from the firehose.
 */

module.exports = function (sails) {

	return function subscribeToFirehose (socket) {
		sails.sockets.join( socket, 'sails_firehose' );
	};

};
