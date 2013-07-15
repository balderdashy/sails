// Get simulated HTTP verb for a given request object
module.exports = function getVerb (socketIOData, messageName) {

	// If message name is not `message`, it's the verb!
	if (messageName && messageName !== 'message') {
		return messageName;
	}

	if (_.isString(socketIOData)) {
		try {
			socketIOData = JSON.parse(socketIOData);
		} catch(e) {
		}
	}

	if (_.isString(socketIOData.verb)) {
		return socketIOData.verb.toLowerCase();
	}

	if (_.isString(socketIOData.method)) {
		return socketIOData.method.toLowerCase();
	}

	return 'get';
};