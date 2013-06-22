/**
 * Module dependencies.
 */

// global: sails

var _		= require( 'lodash' ),
	util	= require( '../../util' ),
	Hook	= require( '../index' ),
	blueprint = require( './blueprint' );


/**
 * Expose errorHook constructor
 */

module.exports = Hook.extend({
	/**
	 * Other hooks that must be loaded before this one
	 */

	dependencies: ['router'],

	initialize: function () {
		sails.express.app.use(require('./blueprint'));

		// Bind routes before any of the static app routes
		sails.router.on('route:before', function () {
			_.each(self.routes.before, function (middleware, route) {
				sails.router.bind(route, middleware);
			});
		});
	}

});

