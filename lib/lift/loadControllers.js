var async = require('async');
var _ = require('lodash');

module.exports = function (cb) {

	async.auto({
		
		controllers: function (cb) {
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
		}, 

		policies: function (cb) {
			sails.log.verbose('Loading app policies...');

			// Load policy modules
			sails.policies = sails.modules.optional({
				dirname		: sails.config.paths.policies,
				filter		: /(.+)\.(js|coffee)$/,
				replaceExpr	: null
			});
			cb();
		}

	});
};