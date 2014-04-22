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
 *
 * Note that any of these settings (besides 'allRoutes') can be changed on a per-route basis
 * by adding a "cors" object to the route configuration:
 *
 * '/get foo': {
 *   controller: 'foo',
 *   action: 'bar',
 *   cors: {
 *     origin: 'http://foobar.com,https://owlhoot.com'	
 *   }
 *  }
 * 
 */

module.exports.cors = {

	// Allow CORS on all routes by default?  If not, you must enable CORS on a 
	// per-route basis by either adding a "cors" configuration object
	// to the route config, or setting "cors:true" in the route config to
	// use the default settings below.
	allRoutes: false,

	// Which domains which are allowed CORS access?
	// This can be a comma-delimited list of hosts (beginning with http:// or https://)
	// or "*" to allow all domains CORS access.
	origin: '*',

	// Allow cookies to be shared for CORS requests?
	credentials: true,

	// Which methods should be allowed for CORS requests?  This is only used
	// in response to preflight requests (see article linked above for more info)
	methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD',

	// Which headers should be allowed for CORS requests?  This is only used
	// in response to preflight requests.
	headers: 'content-type'

};