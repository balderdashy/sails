/**
 * Module dependencies.
 */

var async			= require('async')
	,	_ = require('lodash')
	,	configure = require('./configure')
	, defaults  = require('./defaults')
	,	onRoute = require('./onRoute')
	, addLayoutShim = require('./layoutshim')
	, addResViewMethod = require('./res.view')
	, render = require('./render')
	, blueprintActions = require('./actions');


module.exports = function (sails) {

	/**
	 * `views` hook
	 * 
	 */

	return {

		defaults: defaults,

		configure: _.partial(configure, sails),

		render: render,

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

				// But wait until after internationalization has happened
				// (if applicable)
				if ( sails.config.hooks.i18n ) {
					sails.after('hook:i18n:loaded', function () {
					});
					sails.router.bind('/*', addResViewMethod, null, {});
				}
				else {
					sails.router.bind('/*', addResViewMethod);
				}
			});

			// Register `{view:'/foo'}` route syntax
			sails.on('route:typeUnknown', _.partial(onRoute, sails));

			// Declare hook loaded when ejs layouts have been applied,
			// views have been inventoried, and view-serving middleware has been prepared
			async.auto({

				Layouts: _.partial(addLayoutShim, sails),

				// Detect and prepare auto-route actions
				// for each view file so they can be routed to
				// using {view:'...'} syntax in `routes.js`
				blueprintActions: _.partial(blueprintActions, sails, this)

			}, cb);

			sails.renderView = this.render;

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
