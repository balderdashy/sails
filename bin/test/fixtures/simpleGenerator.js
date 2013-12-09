/**
 * Module dependencies
 */
var switcher = require('../../../util/switcher');
var _ = require('lodash');


/**
 * Dummy generator
 *
 * Used as a text fixture
 */
module.exports = {

	render: function ( options, cb ) {
		cb = switcher(cb);
		cb();
	}
};
