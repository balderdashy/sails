module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */


	var util		= require( '../../util' );


	/**
	 * Global access to middleware
	 * (useful as helpers)
	 */

	 sails._mixinLocals = _mixinLocals;
	 sails._mixinResError = _mixinResError;
	 sails._mixinServerMetadata = _mixinServerMetadata;
	 sails._mixinReqQualifiers = _mixinReqQualifiers;


	/**
	 * Extend middleware req/res for this route w/ new methods / qualifiers.
	 */

	return {


		/**
		 * Bind req/res syntactic sugar before apply any app-level routes
		 */

		initialize: function (cb) {

			var self = this;

			sails.on('router:before', function () {
				
				sails.router.bind('/*', function addSugarMethods (req, res, next) {

					_mixinLocals(req,res);
					_mixinResError(req,res);
					_mixinServerMetadata(req,res);
					
					// Only apply HTTP middleware if it makes sense
					// (i.e. if this is an HTTP request)
					if (req.protocol === 'http' || req.protocol === 'https') {
						_mixinReqQualifiers(req,res);
					}

					next();
				});

				self.ready = true;

			});

			// Logic to inject before running each middleware
			sails.on('router:route', function (requestState) {
				var req = requestState.req;
				var res = requestState.res;
				var next = requestState.next;

				mixinSugar(req,res);
			});


			cb();
		}
	};


	/**
	 * Always share some basic metadata with views
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinLocals (req,res) {

		res.locals({
			_		: util,
			util	: util,
			session	: req.session,
			title	: sails.config.appName + (req.param('action') ? (' | ' + util.str.capitalize(req.param('action'))) : ''),
			req		: req,
			res		: res,
			sails	: sails
		});
	}




	/**
	 * Override the behavior of res.error to better handle errors
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinResError (req,res) {

		res.error = function respondWithError (err, statusCode) {

			// Argument defaults
			err = err || 'Unexpected error occurred.';
			statusCode = statusCode || 500;


			if (err instanceof Error) {
				var msg = sails.config.environment === 'development' ? err.stack : err.toString();
				return res.send(msg, statusCode);
			}

			if (util.isObject(err)) {
				return res.json(err, statusCode);
			}
			
			return res.send(err, statusCode);
			
		};
	}




	/**
	 * Some syntactic sugar
	 * req.params.all();
	 * (this is applied per-route, not per request)
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function mixinSugar (req,res) {
		
		// Make sure `id` is omitted if it's undefined
		// (since action blueprint routes name an optional :id)
		if ( typeof req.param('id') === 'undefined' ) {
			delete req.params.id;
		}

		var routeParams = _.clone(req.params) || {};
		var queryParams = _.clone(req.query) || {};
		var bodyParams = _.clone(req.body) || {};

		// Combines parameters from the route, query string, and encoded request body
		// to compose a monolithic object of named parameters, irrespective of source
		var allParams = util.extend({}, queryParams, routeParams, bodyParams);

		// Augment params object
		req.params = new Params(routeParams);


		/**
		 * Augmented Params class constructor and methods
		 */
		function Params () {}
		Params.prototype.all = function getAllParameters () {
			return allParams;
		};
	}




	/**
	 * Mix in convenience flags about this request
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinReqQualifiers (req,res) {

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

	function _mixinServerMetadata (req,res) {

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
