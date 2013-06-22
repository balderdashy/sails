module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var fs = require('fs');



	/**
	 * Parse package.json file
	 */

	return function package () {

		var packageJSONPath = __dirname + '/../../package.json';
		var json = fs.readFileSync(packageJSONPath, 'utf-8');
		return JSON.parse(json);

	};

};
