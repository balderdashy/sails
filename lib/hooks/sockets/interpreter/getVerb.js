var util = require('../../../util');

// Get simulated HTTP verb for a given request object
module.exports = function getVerb (socketIOData, messageName) {

	// If message name is not `message`, it's the verb!
	if ( util.isString(messageName) && messageName.toLowerCase() !== 'message' ) {
		return messageName.toUpperCase();
	}

	// try and parse the socket io data if it looks like JSON
	var body;
	if ( util.isString(socketIOData) ) {
		try {
			body = JSON.parse(socketIOData);
		} catch(e) {}
	}

	// Only try to use the socket io data if it's usable
	if ( util.isObject(body) ) {

		if (util.isString(body.verb)) {
			return body.verb.toUpperCase();
		}

		if (util.isString(body.method)) {
			return body.method.toUpperCase();
		}
	}

	return 'GET';
};