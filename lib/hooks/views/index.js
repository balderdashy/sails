/**
 * Module dependencies
 */

var configure = require('./configure');
var getImplicitDefaults = require('./get-implicit-defaults');
var onRoute = require('./onRoute');
var defaultViewRenderingFn = require('./default-view-rendering-fn');
var addResViewMethod = require('./res.view');
var render = require('./render');
var statViews = require('./stat-views');
var htmlScriptify = require('./html-scriptify');





module.exports = function (sails) {

  /**
   * `views` hook
   */
  return {

    defaults: getImplicitDefaults,

    // The view rendering function -- may be overriden if `sails.config.views.getRenderFn` is provided.
    _renderFn: defaultViewRenderingFn,

    configure: function (){
      configure(sails);
    },

    render: render(sails),

    htmlScriptify: htmlScriptify,

    /**
     * Standard responsibilities of `initialize` are to load middleware methods
     * and listen for events to know when to bind any special routes.
     *
     * @api private
     */
    initialize: function (cb) {

      if (!sails.hooks.http) {
        var err = new Error('`views` hook requires the `http` hook, but the `http` hook is disabled.  Please enable both or neither.');
        err.code = 'E_HOOKINIT_DEP';
        err.type = err.code;//<<TODO: remove this
        err.name = 'failed requires `http` hook';
        return cb(err);
      }

      // Before handing off incoming requests, bind handler that adds the `res.view()` method to `res`.
      // (flagging middleware along the way)
      addResViewMethod._middlewareType = 'VIEWS HOOK: addResViewMethod';
      sails.on('router:before', function () {

        // But wait until after internationalization has happened
        // (if applicable)
        if (sails.hooks.i18n) {
          sails.after('hook:i18n:loaded', function () {
            sails.router.bind('/*', addResViewMethod, 'all', { });
          });
        }
        else {
          sails.router.bind('/*', addResViewMethod, 'all');
        }
      });

      // Register `{view:'/foo'}` route target syntax.
      sails.on('route:typeUnknown', function (route){
        return onRoute(sails, route);
      });

      // Expose `sails.renderView()` function to userland.
      // (experimental!)
      sails.renderView = this.render;

      // Check for the existence of view files.
      //
      // This existence tree is used later to detect
      // and prepare implicit actions for each view file
      // to support routes with targets like `{view:'...'}`.
      statViews(sails, this, function (err){
        if (err) {
          return cb(err);
        }
        return cb();
      });
    }
  };

};
