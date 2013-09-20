module.exports = function (sails) {
  var _ = require('lodash');

  return {
    routes: function actionRoutes (controller) {
      var routes = {};
      _.each(_.functions(controller), function bindAction (actionId) {
        actionId = actionId.toLowerCase();
        if (actionId === 'index') {
          routes['/'] = 'index';
        }
        routes['/' + actionId + '/:id?'] = actionId;
      });
      return routes;
    }
  };
};