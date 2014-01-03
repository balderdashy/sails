/**
 * Module dependencies.
 */
var util = require('sails-util');
var _ = require('lodash');




/*
NOTE:

Most of the contents of this file could be eventually migrated into the prototypes of the `req` and `res` objects
we're extending from our Express slave router.  This would also need to happen separately in the HTTP hook (since 
its req and res are distinct), which is why adding the methods via middleware has been a perfectly convenient abstraction
for the time being.

However, this can be rather hard to understand, and as we make an effort to make hooks easier to work with, it may be
wise to abstract these built-in Sails functions in a more declarative way, maybe even outside of hooks altogether.
This is particularly pertinent in the case of errors ( e.g. res.serverError() ).

If you have any ideas, please let me know! (@mikermcneil)
 */

module.exports = function(sails) {


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

						// Provide access to `sails` object
						req._sails = sails;

						// Add a few extra `res.locals` for convenience when using views
						_mixinLocals(req, res);

						// Add res.* methods from userspace
						// (i.e. content-negotiating behaviors for common response scenarios)
						_mixinCustomResponses(req, res);

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

			// Bind an event handler to inject logic before running each middleware
			// within a route/request
			sails.on('router:route', function(requestState) {
				var req = requestState.req;
				var res = requestState.res;
				var next = requestState.next;

				// req.params.all() must be recalculated before matching each route
				// since path params (`req.params`) might have changed.
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
	// (a) An infrastructural issue, or 504  (e.g. MySQL database randomly crashed or Twitter is down)
	// (b) Unexpected bug in app code, or 500 (e.g. `req.session.user.id`, but `req.session.user` doesn't exist)



	/**
	 * _mixinCustomResponses
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	function _mixinCustomResponses(req, res) {

		// A context used to provide access to `req` and `res`
		// from our method definitions.
		var requestCtx = {
			req: req,
			res: res
		};

		_.each(sails.responses, function eachMethod(definition, name) {
			res[name] = _.bind(definition, requestCtx);
		});
	}




	/**
	 * _mixinReqParamsAll
	 *
	 * Mixes in `req.params.all()`, a convenience method to grab all parameters,
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