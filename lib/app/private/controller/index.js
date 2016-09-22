var _ = require('lodash');

module.exports = function(sails) {
  return {
    loadAction: _.bind(require('./load-action'), sails),
    bindRoute: _.bind(require('./bind-route'), sails),
    loadModules: _.bind(require('./load-modules'), sails)
  };
};
