/**
 * Module dependencies
 */
var switcher = require('../../../util/switcher');


/**
 * Dummy generator
 *
 * Used as a text fixture
 */
module.exports = {

	render: function ( options, callback ) {
		var handlers = switcher(callback);
		handlers('test');
	}
};
