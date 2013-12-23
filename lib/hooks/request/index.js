module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */


	var util = require('sails-util');


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


		defaults: {

			// Default 404 (not found) handler
			404: function notFound (req, res) {
				res.send(404);
			},

			// Default 500 (server error) handler
			500: function (errors, req, res) {
				res.send(errors || undefined, 500);
			},

			// Default 403 (forbidden) handler
			403: function (message, req, res) {
				res.send(message || undefined, 403);
			},

			// Default 400 (bad request) handler
			400: function (errors, redirectTo, req, res) {
				res.send(errors || undefined, 400);
			}
		},

		// Don't allow sails to lift until ready 
		// is explicitly set below
		ready: false,


		/**
		 * Bind req/res syntactic sugar before applying any app-level routes
		 */

		initialize: function(cb) {

			var self = this;

			sails.on('router:before', function() {

				sails.router.bind('/*', function (req, res, next) {
					
					// Run connect-flash middleware to support flash messages
					// TODO: potential optimization-- pull this out so it only runs once
					var flashMiddleware = (require('connect-flash')());
					flashMiddleware(req, res, function (err) {
						if (err) return next(err);

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

				});


				self.ready = true;
			});

			// Bind an event handler to inject logic before running each middleware within a route/request
			sails.on('router:route', function(requestState) {
				var req = requestState.req;
				var res = requestState.res;
				var next = requestState.next;

				_mixinReqParamsAll(req, res);
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
			sails.blueprints.serverError(err, req, res, function fallback(e) {
				res.send(e || err || undefined, 500);
			});
		};

		// Synonyms:
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
			sails.blueprints.notFound(req, res, function fallback(e) {
				res.send(e || err || undefined, 404);
			});
		};

		// Synonyms:
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
			sails.blueprints.notFound(err, req, res, function fallback(e) {
				res.send(e || err || undefined, 403);
			});
		};
	}


	/**
	 * res.badRequest()
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
			sails.blueprints.notFound(errors, previous, req, res, function fallback(e) {
				res.send(e || err || undefined, 400);
			});
		};

		// Synonyms:
		res.badrequest = res.badRequest;
	}


	/**
	 * `req.params.all()`
	 *
	 * Mixes in a convenience method to grab all parameters,
	 * whether they're in the path (req.params), query string (req.query),
	 * or request body (req.body).
	 * 
	 * Note: this has to be applied per-route, not per request,
	 * in order to refer to the proper route/path parameters
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinReqParamsAll (req, res) {

		////////////////////////////////////////////////////////////////////
		// The check below is deprecatable since action blueprints
		// will no longer automatically receive the :id? param in their route.
		// 
		// // Make sure `id` is omitted if it's undefined
		// // (since action blueprint routes name an optional :id)
		// if (typeof req.param('id') === 'undefined') {
		// 	delete req.params.id;
		// }
		//////////////////////////////////////////////////////////////////

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
		// (but only if an `:all` route parameter doesn't exist!)
		if (!req.params.all) {
			Object.defineProperty(req.params, 'all', {
				value: function getAllParams() {
					return allParams;
				}
			});
		}
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
		var nodeHTTPServer = sails.hooks.http.server;
		var nodeHTTPServerAddress = (nodeHTTPServer && nodeHTTPServer.address()) || {};
		req.port = req.port || nodeHTTPServerAddress.port || 80;

		// Add access to full base url for convenience
		req.baseUrl = req.protocol + '://' + req.host + (req.port == 80 || req.port == 443 ? '' : ':' + req.port);
	}



};