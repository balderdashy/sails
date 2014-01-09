/**
 * sails-generate-gruntfile-simple
 *
 * New proposed generator specification
 *
 * @type {Generator}
 */
module.exports = {


	/**
	 * Use the scope to figure out which flavor of each of our subgenerator dependencies to require.
	 * @type {Object}
	 */
	dependencies: {
		// "Template" is availble out of the box
		'template': {}
	},

	/**
	 * File(s)/folder(s) to generate, generators+params to user
	 * @type {Object}
	 */
	generate: {
		'.': {
			template: {
				path: function gruntfilePath(scope) {
					return (scope.linker) ? './Gruntfile_linker.js' : './Gruntfile.js';
				}
			}
		}
	}
};