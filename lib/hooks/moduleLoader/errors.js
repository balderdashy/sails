/**
 * Errors
 */

module.exports = {

	invalidModule	: function (module) {
		return new Error('Invalid module:' + module);
	}
};