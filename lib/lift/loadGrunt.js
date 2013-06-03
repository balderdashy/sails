module.exports = function loadGrunt (cb) {
	sails.log.verbose('Loading app Gruntfile...');

	// Now initialize this project's Grunt tasks
	// and execute the environment-specific gruntfile
	sails.spawnGrunt = require('../automation')('default', cb);
};