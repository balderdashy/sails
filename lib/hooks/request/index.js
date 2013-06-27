module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */


	var _		= require( 'lodash' );



	/**
	 * Extend middleware req/res for this route w/ new methods / qualifiers.
	 */

	return {


		/**
		 * Routes to bind before or after routing
		 */

		routes: {

			before: {
				'/*' : function addSugarMethods (req, res, next) {

					mixinLocals(req,res);
					mixinResError(req,res);
					mixinReqQualifiers(req,res);
					mixinServerMetadata(req,res);

					next();
				}
			},

			after: {}
		}
	};


	/**
	 * Always share some basic metadata with views
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function mixinLocals (req,res) {

		res.locals({
			session: req.session,
			title: sails.config.appName + (req.param('action') ? (' | ' + _.str.capitalize(req.param('action'))) : ''),
			req: req,
			res: res
		});
	}




	/**
	 * Override the behavior of res.error to better handle errors
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function mixinResError (req,res) {

		res.error = function respondWithError (err, statusCode) {

			// Argument defaults
			err = err || 'Unexpected error occurred.';
			statusCode = statusCode || 500;


			if (err instanceof Error) {
				var msg = sails.config.environment === 'development' ? err.stack : err.toString();
				return res.send(msg, statusCode);
			}

			if (_.isObject(err)) {
				return res.json(err, statusCode);
			}
			
			return res.send(err, statusCode);
			
		};
	}




	/**
	 * Mix in convenience flags about this request
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function mixinReqQualifiers (req,res) {

		// Flag indicating whether a request would like to receive a JSON response
		req.wantsJSON =	req.xhr;
		req.wantsJSON =	req.wantsJSON || !req.accepts('html');
		req.wantsJSON =	req.wantsJSON || ( req.is('json') && req.get('Accept') );

		// Legacy support for Sails 0.8.x
		req.isAjax = req.xhr;
		req.isJson = req.header('content-type') === 'application/json';
		req.acceptJson = req.header('Accept') === 'application/json';
		req.isJsony = req.isJson || req.acceptJson;
	}




	/**
	 * Host, port, etc.
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function mixinServerMetadata (req,res) {

		// Access to server port, if available
		req.port = req.port;

		// Add access to full base url for convenience
		req.baseUrl = req.protocol + '://' + req.host + (req.port == 80 || req.port == 443 ? '' : ':' + req.port);

		// Legacy support for Sails 0.8.x
		req.rawHost = req.host;
		req.rootUrl = req.baseUrl;
		req.baseurl = req.baseUrl;
	}



};
