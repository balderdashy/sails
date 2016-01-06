

module.exports = function (sails) {


  /**
   * Handle `route:typeUnknown` events.
   * This "teaches" the router to understand `response` in route target syntax.
   * This allows route addresses to be bound directly to one of this Sails app's response modules.
   * (i.e. usually defined in your app's `api/responses/` folder, or in the case of res.ok(),
   *  res.serverError(), etc., provided by default from Sails core)
   *
   * e.g.
   * ```
   * 'get /admin/sweet-dashboard-or-report-or-something': { response: 'notImplemented' }
   * ```
   *
   * @param {Dictionary} route
   *        route target definition
   */
  return function onRoute (route) {

    // If we have a matching response, use it.
    if (route.target && route.target.response) {
      if (sails.middleware.responses[route.target.response]) {
        sails.log.silly('Binding response ('+route.target.response+') to '+route.verb+' '+route.path);
        sails.router.bind(route.path, function(req, res) {
          res[route.target.response]();
        }, route.verb, route.options);
      }
      // Invalid respose?  Ignore and continue.
      else {
        sails.log.error(route.target.response +' :: ' +
        'Ignoring invalid attempt to bind route to an undefined response:',
        'for path: ', route.path, route.verb ? ('and verb: ' + route.verb) : '');
        return;
      }
    }
  };

};

