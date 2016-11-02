var _ = require('@sailshq/lodash');

module.exports = function(sails) {
  return {
    registerAction: _.bind(require('./register-action'), sails),
    loadModules: _.bind(require('./load-modules'), sails)
  };
};
