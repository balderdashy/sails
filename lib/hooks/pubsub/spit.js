/**
 * Stop drinking from the firehose.
 */

module.exports = function (sails) {

	return function unsubscribeFromFirehose ( socket ) {
		sails.sockets.leave(socket, 'sails_firehose');
	};

};
