module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */


	var util = require('../../util');


	/**
	 * Global access to middleware
	 * (useful as helpers)
	 */

	sails._mixinLocals = _mixinLocals;
	sails._mixinServerMetadata = _mixinServerMetadata;
	sails._mixinReqQualifiers = _mixinReqQualifiers;


	/**
	 * Extend middleware req/res for this route w/ new methods / qualifiers.
	 */

	return {

		// Don't allow sails to lift until ready 
		// is explicitly set below
		ready: false,


		/**
		 * Bind req/res syntactic sugar before apply any app-level routes
		 */

		initialize: function(cb) {

			var self = this;

			sails.on('router:before', function() {

				// Apply connect-flash middleware
				sails.router.bind('/*', function supportFlashMsgs(req, res, next) {
					require('connect-flash')()(req, res, next);
				});

				sails.router.bind('/*', function addSugarMethods(req, res, next) {

					// Add a few extra `res.locals` for convenience when using views
					_mixinLocals(req, res);

					// Add content-negotiating behaviors for common response scenarios
					_mixinResServerError(req, res);
					_mixinResNotFound(req, res);
					_mixinResForbidden(req, res);
					_mixinResBadRequest(req, res);

					// Add information about the server to the request context
					_mixinServerMetadata(req, res);

					// Only apply HTTP middleware if it makes sense
					// (i.e. if this is an HTTP request)
					if (req.protocol === 'http' || req.protocol === 'https') {
						_mixinReqQualifiers(req, res);
					}

					next();
				});

				self.ready = true;

			});

			// Logic to inject before running each middleware
			sails.on('router:route', function(requestState) {
				var req = requestState.req;
				var res = requestState.res;
				var next = requestState.next;

				mixinSugar(req, res);
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

	function _mixinLocals(req, res) {
		util.extend(res.locals, {
			_: util,
			util: util,
			session: req.session,
			title: sails.config.appName + (req.param('action') ? (' | ' + util.str.capitalize(req.param('action'))) : ''),
			req: req,
			res: res,
			sails: sails
		});
	}



	// TODO:
	// We could differentiate between 500 (generic error message)
	// and 504 (gateway did not receive response from upstream server) which could describe an IO problem
	// This is worth having a think about, since there are 2 fundamentally different kinds of "server errors":
	// (a) An infrastructural issue (e.g. MySQL database randomly crashed or Twitter is down)
	// (b) Unexpected bug in app code (e.g. `req.session.user.id`, but `req.session.user` doesn't exist)



	/**
	 * res.serverError()
	 * (i.e. 500: Server Error)
	 *
	 * Respond as defined in `config/500.js`
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinResServerError(req, res) {
		res.serverError = function respond500(err) {
			sails.config[500](err, req, res, function fallback(e) {
				res.send(e || err || undefined, 500);
			});
		};

		// Also add res.error and res.servererror as synonyms
		res.error = res.serverError;
		res.servererror = res.serverError;
	}


	/**
	 * res.notFound()
	 * (i.e. 404: Not Found)
	 *
	 * Respond as defined in `config/404.js`
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinResNotFound(req, res) {
		res.notFound = function respond404() {

			// Call default 404 handler
			sails.config[404](req, res, function fallback(e) {
				res.send(e || err || undefined, 404);
			});
		};

		// Also add res.unknown and res.notfound as synonyms
		res.unknown = res.notFound;
		res.notfound = res.notFound;
	}


	/**
	 * res.forbidden()
	 * (i.e. 403: Forbidden or 401: Unauthorized)
	 *
	 * Respond as defined in `config/403.js`
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinResForbidden(req, res) {
		res.forbidden = function respond403(err) {
			sails.config[403](err, req, res, function fallback(e) {
				res.send(e || err || undefined, 403);
			});
		};
	}


	/**
	 * res.invalid()
	 * (i.e. 400: Bad Request)
	 *
	 * Respond as defined in `config/400.js`
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinResBadRequest(req, res) {

		/**
		 * @param {Array} errors
		 * @param {String} previous
		 */

		res.badRequest = function respond400(errors, previous) {
			sails.config[400](errors, previous, req, res, function fallback(e) {
				res.send(e || err || undefined, 400);
			});
		};

		// Also add res.badrequest as synonym
		res.badrequest = res.badRequest;
	}


	/**
	 * Some syntactic sugar
	 * e.g. `req.params.all()`
	 *
	 * Note: this has to be applied per-route, not per request,
	 * in order to refer to the proper route/path parameters
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function mixinSugar(req, res) {

		// Make sure `id` is omitted if it's undefined
		// (since action blueprint routes name an optional :id)
		if (typeof req.param('id') === 'undefined') {
			delete req.params.id;
		}

		// Combines parameters from the query string, and encoded request body
		// to compose a monolithic object of named parameters, irrespective of source
		var queryParams = util.clone(req.query) || {};
		var bodyParams = util.clone(req.body) || {};
		var allParams = util.extend({}, queryParams, bodyParams);


		// Mixin route params 
		util.each(Object.keys(req.params), function(paramName) {
			allParams[paramName] = req.params[paramName];
		});

		// Define a new non-enuerable function: req.params.all()
		// (but only if an `:all` route parameter doesn't exist)
		if (!req.params.all) {
			Object.defineProperty(req.params, 'all', {
				value: function getAllParams() {
					return allParams;
				}
			});
		}

		// TODO: make req.params() do the same thing as req.params.all() ??

	}



	/**
	 * Mix in convenience flags about this request
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinReqQualifiers(req, res) {
		var accept = req.get('Accept') || '';

		// Flag indicating whether HTML was explicitly mentioned in the Accepts header
		req.explicitlyAcceptsHTML = (accept.indexOf('html') !== -1);

		// Flag indicating whether a request would like to receive a JSON response
		req.wantsJSON = req.xhr;
		req.wantsJSON = req.wantsJSON || !req.explicitlyAcceptsHTML;
		req.wantsJSON = req.wantsJSON || (req.is('json') && req.get('Accept'));

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

	function _mixinServerMetadata(req, res) {

		// Access to server port, if available
		req.port = req.port || sails.express.server.address().port;

		// Add access to full base url for convenience
		req.baseUrl = req.protocol + '://' + req.host + (req.port == 80 || req.port == 443 ? '' : ':' + req.port);

		// Legacy support for Sails 0.8.x
		req.rawHost = req.host;
		req.rootUrl = req.baseUrl;
		req.baseurl = req.baseUrl;
	}



};