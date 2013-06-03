module.exports = function (cb) {
	sails.log.verbose('Loading app controllers...');

	// Load app controllers
	sails.controllers = sails.modules.optional({
		dirname		: sails.config.paths.controllers,
		filter		: /(.+)Controller\.(js|coffee)$/,
		replaceExpr	: /Controller/
	});

	// Get federated controllers where actions are specified each in their own file
	var federatedControllers = sails.modules.optional({
		dirname			: sails.config.paths.controllers,
		pathFilter		: /(.+)\/(.+)\.(js|coffee)$/
	});
	sails.controllers = _.extend(sails.controllers,federatedControllers);

	cb();
};