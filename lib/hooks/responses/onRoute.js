

module.exports = function (sails) {
	
	/**
	 * Handle route:typeUnknown events
	 *
	 * This allows the hook to handle routes like "get /user": {response: 'forbidden'}
	 * on behalf of the router
	 * @param  {object} route object
	 */
	return function onRoute (route) {

		// Get the route info
		var target = route.target,
			path = route.path,
			verb = route.verb,
			options = route.options;

		// If we have a matching response, use it
		if (target && target.response) {
			if (sails.middleware.responses[target.response]) {
				sails.log.silly('Binding response ('+target.response+') to '+verb+' '+path);
				sails.router.bind(path, function(req, res) {
					res[target.response]();
				}, verb, options);
			}
			// Invalid respose?  Ignore and continue.
			else {
				sails.log.error(target.response +' :: ' +
				'Ignoring invalid attempt to bind route to an undefined response:', 
				'for path: ', path, verb ? ('and verb: ' + verb) : '');
				return;
			}
		}
	};

};

