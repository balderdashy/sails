/**
 * `sails lift`
 *
 * Expose method which lifts the appropriate instance of Sails.
 * (Fire up the Sails app in our working directory.)
 *
 * @param {Object} options - to pass to sails.lift()
 */
module.exports = function() {
	var log = this.logger;
	var sailsOptions = this.baseOptions;

	// Ensure options passed in are not mutated
	var options = _.cloneDeep(sailsOptions);

	// Use the app's local Sails in `node_modules` if one exists
	var appPath = process.cwd();
	var localSailsPath = appPath + '/node_modules/sails';

	// But first make sure it'll work...
	if (Sails.isLocalSailsValid(localSailsPath, appPath)) {
		require(localSailsPath + '/lib').lift(options);
		return;
	}

	// Otherwise, if no workable local Sails exists, run the app 
	// using the currently running version of Sails.  This is 
	// probably always the global install.
	var globalSails = new Sails();
	globalSails.lift(options);
	return;
};
