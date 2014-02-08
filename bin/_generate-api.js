/**
 * Module dependencies
 */
var async = require('async')
	, sailsgen = require('sails-generate')
	, STRINGFILE = require('sails-stringfile')
	, _ = require('lodash');


//
// Run both the controller and model generators and add in a couple
// of extra log messages.
// (todo: pull this out into a simple generator)
module.exports = function generateAPI (scope, cb) {

	console.log();

	// Create the controller and model
	async.parallel(_.map(['controller', 'model'], subGen), function(err) {

		// As long as there were no errors, add some logs about how to call the new API
		if (!err) {
			console.log();
			cb.log.info('REST API generated @ ' + ('http://localhost:1337/' + scope.args[0]).underline);
			cb.log.info('and will be available the next time you run `sails lift`.');
			STRINGFILE.terminalLinkHelp(cb.log.info);
		}
	});

	// Create a function suitable for use with async.parallel to run a generator.
	// Uses "cb.log" b/c it has that nice log format.
	function subGen(generatorType) {
		var _scope = _.extend({}, _.cloneDeep(scope), {generatorType: generatorType});
		return function(_cb) {
			sailsgen (_scope, {
				success: function() {
					cb.log('Generated a new '+_scope.generatorType+' `'+_scope.id+'` at '+_scope.destDir+_scope.globalID+'.js!');
					return _cb();
				},
				error: function(err) {
					cb.error(err);
					return _cb(err);
				}
			});
		};
	}
};
