/**
 * Cross-Origin Resource Sharing (CORS)
 *
 * CORS is like a more modern version of JSONP-- it allows your server/API
 * to successfully respond to requests from client-side JavaScript code 
 * running on some other domain (e.g. google.com)
 * Unlike JSONP, it works with POST, PUT, and DELETE requests
 * 
 * For more information on CORS, check out:
 * http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
 */

module.exports.cors = {

	// Domains which are allowed to 
	origin: false,
	
	// Apply to all routes, if configured
	mountPath: '/*',

	// HTTP methods allowed over CORS (aka verbs)
	methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD'

	// credentials: true,

	// headers: 'content-type'

};