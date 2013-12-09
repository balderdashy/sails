/**
 * Module dependencies
 */
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');
var switcher = require('../../../../util/switcher');



/**
 * Generate a JSON file
 *
 * @option {String} pathToNew
 * @option {Object} data
 * [@option {Boolean} force=false]
 *
 * @handlers ok
 * @handlers error
 * @handlers alreadyExists
 */
module.exports = function ( options, handlers ) {

	// Provide default values for handlers
	handlers = switcher(handlers, handlers.error);

	// Provide defaults and validate required options
	_.defaults(options, {
		force: false
	});

	var missingOpts = _.difference([
		'pathToNew',
		'data'
	], Object.keys(options));
	if ( missingOpts.length ) return handlers.invalid(missingOpts);


	var pathToNew = path.resolve( process.cwd() , options.pathToNew );

	// Only override an existing file if `options.force` is true
	fs.exists(pathToNew, function (exists) {
		if (exists && !options.force) {
			return handlers.alreadyExists(pathToNew);
		}

		if ( exists ) {
			fs.remove(pathToNew, function deletedOldINode (err) {
				if (err) return handlers.error(err);
				_afterwards_();
			});
		}
		else _afterwards_();

		function _afterwards_ () {
			fs.outputJSON(pathToNew, options.data, function (err){
				if (err) return handlers.error(err);
				else handlers.ok();
			});
		}
	});
};
