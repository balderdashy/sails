/**
 * Module dependencies
 */

var _ = require('lodash');




/**
 * `use` middleware in the correct order.
 *
 * @param  {express.app} app
 * @param  {Object} wares  - dictionary of preconfigured middleware
 * @param  {sails.app} sails
 */
module.exports = function builtInMiddlewareLoader (app, wares, sails) {

  _.each(sails.config.http.middleware.order, function (middlewareKey) {

    // Special case:
    // allows for injecting a custom function to attach middleware:
    if (middlewareKey === '$custom' && sails.config.http.customMiddleware) {
      sails.config.http.customMiddleware(app);
    }

    // Otherwise, just use the middleware normally.
    if (wares[middlewareKey]) app.use(wares[middlewareKey]);
  });
};
