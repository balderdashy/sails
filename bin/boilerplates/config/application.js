module.exports = {

	// Port this Sails application will live on
	port: process.env.PORT || 1337,

	// The environment the app is deployed in 
	// (`development` or `production`)
	//
	// In `production` mode, all css and js are bundled up and minified
	// And your views and templates are cached in-memory.  Gzip is also used.
	// The downside?  Harder to debug, and the server takes longer to start.
	environment: process.env.NODE_ENV || 'development'

};