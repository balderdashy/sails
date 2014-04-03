/**
 * Module dependenies
 */

var _ = require('lodash');


/**
 * Get simulated HTTP method (aka "verb") for a given request object.
 * (NOTE: the returned verb will be in all caps, like "GET" or "POST")
 * 
 * @param  {???} incomingSailsIORequest
 * @param  {String} messageName
 * @return {String} the HTTP verb for this request, e.g. "HEAD" or "PATCH" or "DELETE"
 */
module.exports = function getVerb (incomingSailsIORequest, messageName) {

	// If messageName is not `message` (i.e. legacy 0.8), it must correspond
	// to an HTTP method (this is how socket.io endpoints are set up >= 0.9.x)
	if ( _.isString(messageName) && messageName.toLowerCase() !== 'message' ) {
		return messageName.toUpperCase();
	}

	// try and parse the socket io data if it looks like JSON
	var body;
	if ( _.isString(socketIOData) ) {
		try {
			body = JSON.parse(socketIOData);
		} catch(e) {}
	}

	// Only try to use the socket io data if it's usable
	if ( _.isObject(body) ) {

		if (_.isString(body.verb)) {
			return body.verb.toUpperCase();
		}

		if (_.isString(body.method)) {
			return body.method.toUpperCase();
		}
	}

	return 'GET';
};