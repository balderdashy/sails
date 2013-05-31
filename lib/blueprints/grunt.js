var _ = require('lodash');

// Handle signals from grunt watch process
// (NOTE: automatically disabled in production env)
module.exports = function ( req, res ) {
	if (!req.query || !_.isString(req.query.filepath) || !req.query.action) {
		return res.send('Missing required parameter.', 500);
	}
	
	// Peel off path and filename
	var parentPath = req.query.filepath.replace(/\/[^/]+$/, '');
	var moduleName = req.query.filepath.replace(/^.+\//, '');

	// Determine module type
	var moduleType;
	checkModuleType('config');
	checkModuleType('controllers');
	checkModuleType('policies');
	checkModuleType('services');
	checkModuleType('adapters');
	checkModuleType('models');
	
	// Whether this module is of a the given type
	function checkModuleType (type) {

		// Prepare the configured paths for module type
		var relativePath = sails.config.paths[type].replace(sails.config.appPath, '');
		if (parentPath === relativePath) {
			moduleType = type;
		}
	}

	// Reload module into memory from disk
	// Reload module into memory from disk
	if (req.query.action === 'added' || req.query.action === 'changed') {

		// do nothing for now
		res.send(200);

		// require('fs').readFile(req.query.filepath, { encoding: 'utf8' }, function (err, data) {
			// if (err) return res.send(err, 500);

			// TODO:
			// Handle automatically adding new routes for controller actions
			// New models / controllers need to run through the bootstrap logic again as well
			// Config changes should cause the app to rebootstrap
			// sails[moduleType][moduleName] = data; 
			// sails.log.verbose('Reloaded ' + req.query.filepath);  

			// res.send(200);
		// });
	}
	// Remove reference to module from memory
	else if (req.query.action === 'deleted') {

		// do nothing for now
		res.send(200);

		// TODO:
		// Handle automatically removing routes for controller actions
		// New models / controllers need to run through the bootstrap logic again as well
		// Config changes should cause the app to rebootstrap
		// delete sails[moduleType][moduleName];
		res.send(200);
	}
	else res.send(500);
};