module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var util = require('../../util'),
		async = require('async'),
		Modules = require('../../moduleloader');

  function loadModels(path, prefix, cb) {
    Modules.optional({
      dirname		: path,
      filter		: /(.+)\.(js|coffee)$/
    }, function modulesLoaded (err, modules) {
      if (err) return cb(err);
      if(prefix === '') {
        util.merge(sails.models, modules);
      }
      else {
        util.forEach(modules, function(module, key) {
          module.globalId = util.str.capitalize(prefix) + module.globalId;
          sails.models[prefix + key] = module;
        });
      }
      return cb();
    });
  }

	return function (cb) {

		/**
		 * Expose Hook definition
		 */

		sails.log.verbose('Loading the app\'s models and adapters...');
		async.auto({

			models: function(cb) {
				sails.log.verbose('Loading app models...');

				sails.models = {};

				// Load app's model definitions
				// Case-insensitive, using filename to determine identity
				loadModels(sails.config.paths.models, '', function(err) {
          if(err) return cb(err);
          if(sails.config.modules) {
            async.forEach(sails.config.modules.register, function(value, next) {
              loadModels(sails.config.modules.path + '/' + value + '/models', value, function(err){
                if(err) {
                  console.error(' - Models for module "' + value +  '" not loaded!');
                }
                else {
                  console.log(' - Models for module "' + value + '" loaded.');
                }
              });
              next();
            }, cb);
          }
          else {
              return cb();
          }

        });
			},

			adapters: function (cb) {
				sails.log.verbose('Loading app adapters...');

				sails.adapters = {};

				// Load custom adapters
				// Case-insensitive, using filename to determine identity
				Modules.optional({
					dirname		: sails.config.paths.adapters,
					filter		: /(.+Adapter)\.(js|coffee)$/,
					replaceExpr	: /Adapter/
				}, function modulesLoaded (err, modules) {
					if (err) return cb(err);
					sails.adapters = modules;
					return cb();
				});
			}

		}, cb);
	};

};