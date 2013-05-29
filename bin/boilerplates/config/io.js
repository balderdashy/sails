// Configuration for internal socket.io server
module.exports.io = {

	// Socket.io transport config
	transports: [
		'websocket',
		'flashsocket',
		'htmlfile',
		'xhr-polling',
		'jsonp-polling'
	]

	// In production, to scale horizontally to multiple Sails.js servers,
	// you'll need to defer pubsub processing to a messaging queue.
	// By default, Sails provides support for Redis.
	// adapter: 'redis',

	// By default, the local redis instance will be used on the default port
	// You can use the following config to override those settings
	// host: 'localhost',
	// port: 8888
};