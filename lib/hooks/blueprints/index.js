module.exports = function (sails) {

  var _ = require('lodash'),
    Modules = require('../../moduleloader');

  return {
    ready: false,
    initialize: function (cb) {
      var self = this;
      sails.blueprints = {};
      Modules.optional({
        dirname: __dirname,
        filter: /^(?!index\.js$)(.+)\.js$/
      }, function coreBlueprintsLoaded (err, modules) {
        if (err) return cb(err);

        _.each(modules, loadModule);

        Modules.optional({
          dirname: sails.config.paths.blueprints,
          filter: /(.+)\.(js|coffee)$/
        }, function userBlueprintsLoaded (err, modules) {
          if (err) return cb(err);

          _.each(modules, loadModule);

          self.ready = true;
          cb(null);
        });
      });
    }
  };

  function loadModule (module, moduleId) {
    if (_.isFunction(module)) {
      var fn = module;
      module = fn(sails);
      module.identity = fn.identity;
      module.globalId = fn.globalId;
    }
    sails.blueprints[module.identity] = module;
  }

};