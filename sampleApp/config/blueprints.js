/**
 * Blueprints
 *
 * <%
 * //
 * //  [[ TODO: pull this out into sails-stringfile ]]
 * //
 * %>
 * Sails inspects your controllers, models, and configuration and binds
 * certain routes automatically. These dynamically generated routes are called blueprints.
 *
 * These settings are for the global configuration of controllers & blueprint routes.
 * You may also override these settings on a per-controller basis by defining a '_config'
 * key in any of your controller files, and assigning it an object, e.g.:
 * {
 *     // ...
 *     _config: { rest: false }
 *     // ...
 * }
 *
 * For more information on configuring controllers and blueprints, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.blueprints = {

  i18n: true,


  /**
   * NOTE:
   * A lot of the configuration options below affect so-called "CRUD methods",
   * or your controllers' `find`, `create`, `update`, and `destroy` actions.
   *
   * It's important to realize that, even if you haven't defined these yourself, as long as
   * a model exists with the same name as the controller, Sails will respond with built-in CRUD
   * logic in the form of a JSON API, including support for sort, pagination, and filtering.
  */



  /**
   * Controller/Action Blueprints
   * (`sails.config.blueprints.actions`)
   *
   * Action blueprints speed up the backend development workflow by eliminating the need
   * to manually bind routes. When enabled, GET, POST, PUT, and DELETE routes will be
   * generated for every one of a controller's actions.
   *
   * If an `index` action exists, additional naked routes will be created for it.
   * Finally, all `actions` blueprints support an optional path parameter, `id`, for convenience.
   *
   * For example, assume we have an EmailController with actions `send` and `index`.
   * With `actions` enabled, the following blueprint routes would be bound at runtime:
   *
   * `EmailController.index`
   * :::::::::::::::::::::::::::::::::::::::::::::::::::::::
   * `GET     /email/:id?`        `GET    /email/index/:id?`
   * `POST    /email/:id?`        `POST   /email/index/:id?`
   * `PUT     /email/:id?`        `PUT    /email/index/:id?`
   * `DELETE  /email/:id?`        `DELETE /email/index/:id?`
   *
   * `EmailController.send`
   * :::::::::::::::::::::::::::::::::::::::::::::::::::::::
   * `GET     /email/send/:id?`
   * `POST    /email/send/:id?`
   * `PUT     /email/send/:id?`
   * `DELETE  /email/send/:id?`
   *
   *
   * `actions` are enabled by default, and can be OK for production-- however,
   * if you'd like to continue to use controller/action autorouting in a production deployment,
   * you must take great care not to inadvertently expose unsafe/unintentional controller logic
   * to GET requests.
   */
  actions: true,



  /**
   * RESTful Blueprints
   * (`sails.config.blueprints.rest`)
   *
   * REST blueprints are the automatically generated routes Sails uses to expose
   * a conventional REST API on top of a controller's `find`, `create`, `update`, and `destroy`
   * actions.
   *
   * For example, a BoatController with `rest` enabled generates the following routes:
   * :::::::::::::::::::::::::::::::::::::::::::::::::::::::
   * GET      /boat/:id?      -> BoatController.find
   * POST     /boat           -> BoatController.create
   * PUT      /boat/:id       -> BoatController.update
   * DELETE   /boat/:id       -> BoatController.destroy
   *
   * `rest` blueprints are enabled by default, and are suitable for a production scenario,
   * as long you take standard security precautions (combine w/ policies, etc.)
   */
  rest: true,


  /**
   * `shortcuts`
   *
   * Shortcut blueprints are simple helpers to provide access to a controller's CRUD methods
   * from your browser's URL bar.  When enabled, GET, POST, PUT, and DELETE routes will be generated
   * for the controller's`find`, `create`, `update`, and `destroy` actions.
   *
   * `shortcuts` are enabled by default, but SHOULD BE DISABLED IN PRODUCTION!!!!!
   */
  shortcuts: true,



  /**
   * `prefix`
   *
   * An optional mount path for all blueprint routes on a controller, including `rest`,
   * `actions`, and `shortcuts`.  This allows you to take advantage of blueprint routing,
   * even if you need to namespace your API methods.
   *
   * * (NOTE: This only applies to blueprint autoroutes, not manual routes from `sails.config.routes`)
   *
   * For example, `prefix: '/api/v2'` would make the following REST blueprint routes
   * for a FooController:
   *
   * `GET /api/v2/foo/:id?`
   * `POST /api/v2/foo`
   * `PUT /api/v2/foo/:id`
   * `DELETE /api/v2/foo/:id`
   *
   * By default, no prefix is used.
   */
  prefix: '',





  /**
   * `pluralize`
   *
   * Whether to pluralize controller names in blueprint routes.
   *
   * (NOTE: This only applies to blueprint autoroutes, not manual routes from `sails.config.routes`)
   *
   * For example, REST blueprints for `FooController` with `pluralize` enabled:
   * GET    /foos/:id?
   * POST   /foos
   * PUT    /foos/:id?
   * DELETE /foos/:id?
   */
  pluralize: false

};
