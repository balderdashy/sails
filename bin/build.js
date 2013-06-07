// Build mock sails object
var sails = require('./mockSails.js');

module.exports = function() {
	sails.log.info('Building assets into directory...');
	require('../lib').build('build', function () {
		sails.log.info('Successfully built \'www\' directory in the application root.');
	});
};