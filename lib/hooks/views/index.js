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
	, implicitActions = require('./actions');


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

      if ( !sails.hooks.http ) {

        var err = new Error();
        err.message = '`views` hook requires the `http` hook, but the `http` hook is disabled.  Please enable both or neither.';
        err.type = err.code = 'E_HOOKINIT_DEP';
        err.name = 'failed requires `http` hook';
        err.status = 400;
        return cb(err);
      }

      addResViewMethod._middlewareType = 'VIEWS HOOK: addResViewMethod';

			// Add res.view() method to compatible middleware
			sails.on('router:before', function () {

				// But wait until after internationalization has happened
				// (if applicable)
				if ( sails.hooks.i18n ) {
					sails.after('hook:i18n:loaded', function () {
            sails.router.bind('/*', addResViewMethod, 'all', {});
          });
				}
				else {
					sails.router.bind('/*', addResViewMethod, 'all');
				}
			});

			// Register `{view:'/foo'}` route syntax
			sails.on('route:typeUnknown', _.partial(onRoute, sails));

			// Declare hook loaded when ejs layouts have been applied,
			// views have been inventoried, and view-serving middleware has been prepared
			async.auto({

				Layouts: _.partial(addLayoutShim, sails),

				// Detect and prepare implicit actions
				// for each view file so they can be routed to
				// using {view:'...'} syntax in `routes.js`
				implicitActions: _.partial(implicitActions, sails, this)

			}, cb);

			sails.renderView = this.render;
		}
	};

};
