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
				// Legacy (< v0.10) support for configured handler
				if ( typeof sails.config[500] === 'function' ) {
					sails.log.warn('sails.config[500] (i.e. `config/500.js`) has been superceded in Sails v0.10 by the `serverError.js` blueprint.');
					sails.log.warn('sails.config[500] will be deprecated in an upcoming release.');
					sails.log.warn('Please use the serverError blueprint instead. (i.e. api/blueprints/errors/serverError.js)');
					return sails.config[500](err, req, res);
				}

				// Use error handler if it exists
				if ( typeof res.serverError === 'function' ) {
					return res.serverError(err);
				}
				
				// Catch-all:
				// Log a message and try to use `res.send` to respond.
				sails.log.error('An error occurred in a request, but no error handler is configured.');
				sails.log.error(err);
				res.send(500, err);
				return;
			}
			catch(e) {
				sails.log.error('A request reached the default `serverError` (aka 500) handler in Sails... but no response could be sent!');
				sails.log.error('Here\'s the error Sails encountered:\n', e);
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
				// Legacy (< v0.10) support for configured handler
				if ( typeof sails.config[404] === 'function' ) {
					sails.log.warn('sails.config[404] (i.e. `config/404.js`) has been superceded in Sails v0.10 by the `notFound.js` blueprint.');
					sails.log.warn('sails.config[404] will be deprecated in an upcoming release.');
					sails.log.warn('Please use the notFound blueprint instead. (i.e. api/blueprints/errors/notFound.js)');
					return sails.config[404](req, res);
				}

				// Use notFound handler if it exists
				if ( typeof res.notFound === 'function' ) {
					return res.notFound();
				}

				// Catch-all:
				// Log a message and try to use `res.send` to respond.
				res.send(404);
				sails.log.verbose('A request did not match any routes, and no notFound handler is configured.');
				return;
			}
			catch (e) {
				sails.log.error('A request reached the default `notFound` (aka 404) handler in Sails... but no response could be sent!');
				sails.log.error('Here\'s the error Sails encountered:\n', e);
				return;
			}
		}
	};

};

