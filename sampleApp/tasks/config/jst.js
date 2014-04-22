/**
 * Precompiles Underscore templates to a `.jst` file.
 *
 * ---------------------------------------------------------------
 *
 * (i.e. basically it takes HTML files and turns them into tiny little
 *  javascript functions that you pass data to and return HTML. This can
 *  speed up template rendering on the client, and reduce bandwidth usage.)
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-jst
 *
 */

module.exports = function(grunt) {

	var templateFilesToInject = [
		'templates/**/*.html'
	];

	grunt.config.set('jst', {
		dev: {

			// To use other sorts of templates, specify a regexp like the example below:
			// options: {
			//   templateSettings: {
			//     interpolate: /\{\{(.+?)\}\}/g
			//   }
			// },

			// Note that the interpolate setting above is simply an example of overwriting lodash's
			// default interpolation. If you want to parse templates with the default _.template behavior
			// (i.e. using <div></div>), there's no need to overwrite `templateSettings.interpolate`.


			files: {
				// e.g.
				// 'relative/path/from/gruntfile/to/compiled/template/destination'  : ['relative/path/to/sourcefiles/**/*.html']
				'.tmp/public/jst.js': require('../pipeline').templateFilesToInject
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jst');
};
