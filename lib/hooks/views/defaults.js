/**
 * Implicit defaults
 *
 * @param  {Object} config
 * @context hook
 * 
 * @return {Object}
 */

module.exports = function defaults (config) {
	return {
		views: {

			// Engine for views (can be ejs, haml, etc.)
			engine: 'ejs',

			// Layout is on by default, in the top level of the view directory
			// true === use default
			// false === don't use a layout
			// string === path to layout
			layout: true
		},

		paths: {
			views: config.appPath + '/views',
			layout: config.appPath + '/views/layout.ejs'
		}
	};
};
