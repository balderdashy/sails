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

	routes: {
		
		before: {
			'*': blueprint
		},

		after: {}
	}

	
});

