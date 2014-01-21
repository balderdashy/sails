/**
 * Module dependencies.
 */

var async			= require('async')
	,	_configure = require('./configure')
	, _defaults = require('./defaults')
	,	_interpretRouteSyntax = require('./route')
	, _layoutshim = require('./layoutsshim')
	, _addResViewMethod = require('./res.view')
	, _actions = require('./actions');




module.exports = function (sails) {

	/**
	 * Expose Hook definition
	 */

	return {

		defaults: _defaults,

		configure: _configure,


		/**
		 * Standard responsibilities of `initialize` are to load middleware methods
		 * and listen for events to know when to bind any special routes.
		 *
		 * @api private
		 */

		initialize: function (cb) {

			if ( !sails.config.hooks.http ) {
				return cb('`views` hook requires the `http` hook, but the `http` hook is disabled.  Please enable both or neither.');
			}
				
			// Add res.view() method to compatible middleware
			sails.on('router:before', function () {

				if ( sails.config.hooks.i18n ) {
					sails.after('hook:i18n:loaded', function () {
						sails.router.bind('/*', _addResViewMethod);
					});
				}
				else {
					sails.router.bind('/*', _addResViewMethod);
				}
			});

			// Register `{view:'/foo'}` route syntax
			sails.on('route:typeUnknown', _interpretRouteSyntax);

			// Declare hook loaded when ejs layouts have been applied,
			// views have been inventoried, and view-serving middleware has been prepared
			async.auto({

				ejsLayouts: _.partial(_layoutshim, sails),

				// Detect and prepare auto-route actions
				// for each view file
				// 
				// NOTE: currently disabled. (see actions.js)
				// blueprints: _actions

			}, cb);


			//
			// TODO: determine whether this is safe to deprecate:
			//

			// Intercept each middleware and apply route options
			// sails.on('router:route', _interceptRoute(event));
		},


		//
		// TODO: determine whether this is safe to deprecate:
		//

		// Logic to inject before each middleware runs		 
		// _interceptRoute: function (event) {
		// 	var req = event.req,
		// 		res	= event.res,
		// 		next = event.next,
		// 		options = event.options;


		// 	// Merge in any view locals specified in route options
		// 	if (options.locals) {
		// 		_.extend(res.locals, options.locals);
		// 		sails.log.silly('Merged in view locals..',res.locals);
		// 	}
		// },
	};

};
