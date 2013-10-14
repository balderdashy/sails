module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var loadSocketIO = require('./loadSocketIO')(sails);



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

				// If http hook is enabled, wait until the http server is configured
				// before linking the socket server to it
				sails.after('hook:http:loaded', function () {
					sails.after('hook:session:loaded', function () {
						loadSocketIO(cb);
					});
				});
				
			}
			else {

				// TODO: implement standalone socket server usage
				var notImplementedError = 
					'Socket server cannot be started without HTTP server because the feature ' +
					'has not been implemented yet!\n' +
					'For now, please reenable the `http` hook.';
				sails.log.error(notImplementedError);
				throw new Error(notImplementedError);

				// If not, configure the socket server immediately
				// loadSocketIO(cb);

				// // TODO: Start independent socket server as soon as sails is ready
				// sails.on('ready', function () {
				// 	// TODO
				// });
			}

		}
	};

};