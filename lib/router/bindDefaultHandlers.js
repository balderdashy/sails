module.exports = function (sails) {


	return {

		/**
		 * Default 500 handler.
		 * 
		 * @param  {[type]} err [description]
		 * @param  {[type]} req [description]
		 * @param  {[type]} res [description]
		 * @return {[type]}     [description]
		 */
		500: function (err, req, res) {
			try {
				if ( typeof sails.config[500] === 'function' ) {
					sails.log.warn('sails.config[500] (i.e. `config/500.js`) has been superceded in Sails v0.10 by the `serverError.js` blueprint.');
					sails.log.warn('sails.config[500] will be deprecated in an upcoming release.');
					sails.log.warn('Please use the serverError blueprint instead. (i.e. api/blueprints/errors/serverError.js)');
					return sails.config[500](err, req, res);
				}

				if ( typeof (sails.blueprints && sails.blueprints.serverError) === 'function' ) {
					return sails.blueprints.serverError(err, req, res);
				}
				
				// Log an error and try to use `res.send` to respond.
				sails.log.error('An error occurred in a request, but no error handler is configured.');
				sails.log.error(err);
				res.send(err, 500);
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
		 * 
		 * @param  {[type]} req [description]
		 * @param  {[type]} res [description]
		 * @return {[type]}     [description]
		 */
		404: function (req, res) {
			try {
				if ( typeof sails.config[404] === 'function' ) {
					sails.log.warn('sails.config[404] (i.e. `config/404.js`) has been superceded in Sails v0.10 by the `notFound.js` blueprint.');
					sails.log.warn('sails.config[404] will be deprecated in an upcoming release.');
					sails.log.warn('Please use the notFound blueprint instead. (i.e. api/blueprints/errors/notFound.js)');
					return sails.config[404](req, res);
				}

				if ( typeof (sails.blueprints && sails.blueprints.notFound) === 'function' ) {
					return sails.blueprints.notFound(req, res);
				}

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

