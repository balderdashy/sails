var async = require('async');
var _ = require('lodash');

module.exports = function (cb) {

	async.auto({

		models: function (cb) {
			sails.log.verbose('Loading app models...');

			// Load app's model definitions
			// Case-insensitive, using filename to determine identity
			sails.models = require('../moduleloader').optional({
				dirname		: sails.config.paths.models,
				filter		: /(.+)\.(js|coffee)$/
			});
			cb();
		},

		adapters: function (cb) {
			sails.log.verbose('Loading app adapters...');

			// Load custom adapters
			// Case-insensitive, using filename to determine identity
			sails.adapters = require('../moduleloader').optional({
				dirname		: sails.config.paths.adapters,
				filter		: /(.+Adapter)\.(js|coffee)$/,
				replaceExpr	: /Adapter/
			});

			// Include default adapters automatically
			// (right now, that's just defaultAdapterName)
			sails.adapters[sails.defaultAdapterModule] = require(sails.defaultAdapterModule);

			cb();
		};
		}

		pubsub: ['models', function (cb) {
			sails.log.verbose('Building pub/sub logic...');

			// Augment models with room/socket logic (& bind context)
			for (var identity in sails.models) {
				sails.models[identity] = _.defaults(sails.models[identity], require('../pubsub'));
				_.bindAll(sails.models[identity], 'subscribe', 'introduce', 'unsubscribe', 'publish', 'room', 'publishCreate', 'publishUpdate', 'publishDestroy');
			}
			cb();
		}]

	}, cb);
};
