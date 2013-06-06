module.exports.session = {

	// Session secret is automatically generated when your new app is created
	// It can be easily replaced here:
	secret: '<%= secret %>'

	// In production, uncomment the following lines to set up a shared redis session store
	// that can be shared across multiple Sails.js servers
	// adapter: 'redis'

	// With the above coniguration, the local redis instance will be used on the default port.
	// If you need to use a remote redis instance (which is probable!) 
	// you can use the raw connect session `store` config for now
	// (see https://github.com/visionmedia/express/blob/master/examples/session/redis.js)


};