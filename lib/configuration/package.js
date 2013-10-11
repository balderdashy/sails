module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var fs = require('fs');



	/**
	 * Parse the package.json file for the currently running Sails installation
	 */

	return function package () {
		var packageJSONPath = __dirname + '/../../package.json';
		var json = fs.readFileSync(packageJSONPath, 'utf-8');
		return JSON.parse(json);
	};

};
