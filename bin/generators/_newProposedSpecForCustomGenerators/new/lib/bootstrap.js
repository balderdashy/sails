/**
 * Pass down scope, adding stuff as necessary
 *
 * @param  {Object} scope [this generator's scope]
 */
module.exports = function (scope, sb) {
	
	// e.g. provide default `appPath` if necessary
	// (TODO: handle internally)
	_.defaults(scope, {
		appPath: process.cwd()
	});

	// Set dirpath
	scope.path = scope.appPath;

	// e.g. load sails if necessary
	// (TODO: handle internally)
	if (scope.sails) return sb(null, scope);
	var sails = require('sails');
	sails.load({}, function (err) {
		if (err) return sb(err);
		return sb(null, _.defaults(scope, {sails: sails}));
	});
};
