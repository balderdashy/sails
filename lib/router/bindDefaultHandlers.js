/**
 * Module dependencies
 */
var util = require('util');




/**
 * Default 500 and 404 handler.
 * (defers to res.serverError() and res.notFound() whenever possible)
 */
module.exports = function (sails) {


	return {

		/**
		 * Default 500 handler.
		 * (for errors implicitly thrown in middleware/routes)
		 * 
		 * @param  {*} err 
		 * @param  {Request} req 
		 * @param  {Response} res 
		 */
		500: function (err, req, res) {
			try {
				// Use error handler if it exists
				if ( typeof res.serverError === 'function' ) {
					return res.serverError(err);
				}
				
				// Catch-all:
				// Log a message and try to use `res.send` to respond.
				sails.log.error('A server error occurred in a request:');
				sails.log.error(err);
				res.send(500, util.inspect(err));
				return;
			}
			catch(e) {

				//
				// Serious error occurred-- unable to send response.
				// TODO: try to kill the abort the request (in case it is still open)
				// 

				sails.log.error('A server error was encountered in a request...');
				sails.log.error('But no response could be sent because an error occurred:\n', util.inspect(e));
				return;
			}
		},



		/**
		 * Default 404 handler.
		 * (for unmatched routes)
		 * 
		 * @param  {Request} req 
		 * @param  {Response} res 
		 */
		404: function (req, res) {
			try {
				// Use notFound handler if it exists
				if ( typeof res.notFound === 'function' ) {
					return res.notFound();
				}
				
				// Catch-all:
				// Log a message and try to use `res.send` to respond.
				sails.log.verbose('A request did not match any routes, and no notFound handler is configured.');
				res.send(404);
				return;
			}
			catch(e) {

				//
				// Serious error occurred-- unable to send response.
				// TODO: try to kill the abort the request (in case it is still open)
				// 
				
				sails.log.error('An unmatched route was encountered in a request...');
				sails.log.error('But no response could be sent because an error occurred:\n', util.inspect(e));
				return;
			}
		}
	};

};

