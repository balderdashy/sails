module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
		sockets = {
			configure: require('./configure')(sails)
		};



	/**
	 * Expose `sockets` hook definition
	 */

	return {


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {

			if (sails.config.hooks.http) {

				// TODO: if http hook is enabled, wait until the http server is configured
				sails.on('hook:http:loaded', function () {
					sockets.configure(cb);
				});
				
				// TODO: Later, when http server starts, start socket.io
				/*
				sails.on('hook:http:listen', function () {
	
				});
				*/
				
			}
			else {

				// If not, configure immediately
				sockets.configure(cb);

				// TODO: Start independent socket server as soon as sails is ready
				sails.on('ready', function () {
					// TODO
				});
			}

		}
	};

};