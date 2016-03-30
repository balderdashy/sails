/**
 * Module dependencies.
 */

var _ = require('lodash');
var toLoadAndRegisterControllers = require('./to-load-and-register-controllers');
var toInterpretRouteSyntax = require('./to-interpret-route-syntax');



/**
 * `controllers` (Core Hook)
 */
module.exports = function(sails) {


  return {


    /**
     * Implicit defaults which will be merged into sails.config before this hook is loaded...
     * @type {Dictionary}
     */
    defaults: {},


    /**
     * Before any hooks have begun loading...
     * (called automatically by Sails core)
     */
    configure: function() {
      // This initial setup of `sails.controllers` was included here as an experimental
      // feature so that these modules would be accessible for other hooks.  This will be
      // deprecated in Sails v1.0 in favor of the ability for hook authors to register or unregister
      // controllers programatically.  In addition, controllers will no longer be exposed
      // on the `sails` app instance.
      sails.controllers = {};
    },


    /**
     * When the hook is loaded...
     * (called automatically by Sails core)
     */
    initialize: function(cb) {

      // In future versions of Sails, the empty registry of controllers can be initialized here:
      // sails.controllers = {};

      // Register route syntax for binding controllers.
      var interpretRouteSyntax = toInterpretRouteSyntax(sails);
      sails.on('route:typeUnknown', interpretRouteSyntax);

      // Load controllers from app and register their actions as middleware.
      // TODO -- make a public .reload() hook method, rather than exposing
      // this private method on the hook object.  Doing this for now because
      // certain apps in the wild are relying on it.
      this.loadAndRegisterControllers = toLoadAndRegisterControllers(sails, this);
      this.loadAndRegisterControllers(cb);
    },


    /**
     * explicitActions
     *
     * This is used to hold a reference to explicit actions and controllers.
     * << This will be removed in a future release of Sails. >>
     *
     * @type {Dictionary}
     * @api private
     */
    explicitActions: {},


  };
};
