module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _							= require('lodash'),
		Session						= require('../../../session')(sails),
		getVerb						= require('./getVerb'),
		createExpressRequestContext = require('./interpret')(sails);


	/**
	 * NOTE:
	 * This module will be drastically simplified in the new Sails 0.9 router.
	 */


	/**
	 * Route an incoming socket message to the Sails router
	 *
	 * @api private
	 */

	return function route (socketReq, fn, socket, messageName) {

		var msg,
			path, params, verb;

		// If invalid callback function specified, freak out
		if (fn && !_.isFunction(fn)) {
			msg = 'Invalid socket request! The following JSON could not be parsed :: '+socketReq;
			return sails.log.error(msg);
		}

		// Parse request as JSON (or just use the object if we have one)
		if (! _.isObject(socketReq)) {
			try {
				socketReq = JSON.parse(socketReq);
			} catch(e) {
				msg = 'Invalid socket request! The following JSON could not be parsed :: '+socketReq;
				if (fn) return fn(msg);
				
				return sails.log.error(msg);
			}
		}

		if (!socketReq.url) {
			msg = 'No url provided in request: '+socketReq;
			if (fn)return fn(msg);
			
			return sails.log.error(msg);
		}

		// Parse out enough information from message to mock an HTTP request
		path = socketReq.url;
		params = _.extend({}, socketReq.params || {}, socketReq.data || {});
		verb = getVerb(socketReq, messageName);

		// TODO

	};


	// 	// function (req, res, next) {}



	// 	// Inspect Express routes to figure out how to route this request


	// 	// Parse url for entity and action using routing table if possible
	// 	var entityAction = sails.router.app.routes.fetchRoute(socketReq.url, );


	// 	console.log(entityAction);
	// 	console.log('->',sails.router.app.routes.get[0].callbacks[0]);
	// 	return;

};
