/**
 * Dependencies
 */

var _ = require('@sailshq/lodash');
var chalk = require('chalk');
var STRINGFILE = require('sails-stringfile');
var Err = require('../../../errors/fatal');
var onRoute = require('./onRoute');




/**
 * Expose hook definition
 */

module.exports = function(sails) {

  return {

    defaults: {},
    configure: function() {

      // Legacy (< v0.10) support for configured handlers
      if (typeof sails.config[500] === 'function') {
        sails.after('lifted', function() {
          STRINGFILE.logDeprecationNotice('sails.config[500]',
            STRINGFILE.get('links.docs.migrationGuide.responses'),
            sails.log.debug);
          sails.log.debug('sails.config[500] (i.e. `config/500.js`) has been superceded in Sails v0.10.');
          sails.log.debug('Please define a "response" instead. (i.e. api/responses/serverError.js)');
          sails.log.debug('Your old handler is being ignored. (the format has been upgraded in v0.10)');
          sails.log.debug('If you\'d like to use the default handler, just remove this configuration option.');
        });
      }
      if (typeof sails.config[404] === 'function') {
        sails.after('lifted', function() {
          STRINGFILE.logDeprecationNotice('sails.config[404]',
            STRINGFILE.get('links.docs.migrationGuide.responses'),
            sails.log.debug);
          sails.log.debug('Please define a "response" instead. (i.e. api/responses/notFound.js)');
          sails.log.debug('Your old handler is being ignored. (the format has been upgraded in v0.10)');
          sails.log.debug('If you\'d like to use the default handler, just remove this configuration option.');
        });
      }
    },



    /**
     * When this hook is loaded...
     */

    initialize: function(cb) {

      // Register route syntax that allows explicit routes
      // to be bound directly to custom responses by name.
      // (e.g. {response: 'foo'})
      sails.on('route:typeUnknown', onRoute(sails));

      cb();
    },



    /**
     * Fetch relevant modules, exposing them on `sails` subglobal if necessary,
     */
    loadModules: function(cb) {
      var hook = this;

      sails.log.silly('Loading runtime custom response definitions...');
      sails.modules.loadResponses(function loadedRuntimeErrorModules(err, responseDefs) {
        if (err) { return cb(err); }

        // Check that none of the custom responses provided from userland collie with
        // reserved response methods/properties.
        //
        // Note: this could be made more flexible in the future-- I've found it to be
        // helpful to sometimes override res.view() in apps.  That said, in those circumstances,
        // I've been able to accomplish this by manually overriding res.view in a custom hook.
        // That said, if that won't work for your use case, please let me know (tweet @mikermcneil).
        var reservedResKeys = [
          'view',
          'status', 'set', 'get', 'cookie', 'clearCookie', 'redirect',
          'location', 'charset', 'send', 'json', 'jsonp', 'type', 'format',
          'attachment', 'sendfile', 'download', 'links', 'locals', 'render'
        ];
        _.each(responseDefs, function (responseDef, customResponseKey) {
          if ( _.contains(reservedResKeys, customResponseKey) ) {
            Err.invalidCustomResponse(customResponseKey);
          }
        });

        // Mix in the built-in default definitions for custom responses.
        _.defaults(responseDefs, {
          ok: require('./defaults/ok'),
          negotiate: require('./defaults/negotiate'),
          notFound: require('./defaults/notFound'),
          serverError: require('./defaults/serverError'),
          forbidden: require('./defaults/forbidden'),
          badRequest: require('./defaults/badRequest')
        });

        // Expose combined custom/default response method definitions on the hook.
        // (e.g. `serverError`, `notFound`, `ok`, etc.)
        // TODO: use this instead of exposing as "middleware", since that's confusing naming.

        // Register blueprint actions as middleware of this hook.
        hook.middleware = responseDefs;

        return cb();
      });
    },



    /**
     * Shadow route bindings
     * @type {Object}
     */
    routes: {
      before: {

        /**
         * Add custom response methods to `res`.
         *
         * @param {Request} req
         * @param {Response} res
         * @param  {Function} next
         * @api private
         */
        'all /*': function addResponseMethods(req, res, next) {

          // Attach res.jsonx to `res` object
          _mixinJsonxMethod(req, res);

          // Attach custom responses to `res` object
          // Provide access to `req` and `res` in each of their `this` contexts.
          _.each(sails.middleware.responses, function eachMethod(responseFn, name) {
            res[name] = responseFn.bind({
              req: req,
              res: res
            });
          });

          // Proceed!
          return next();
        }
      }
    }

  };
};




/**
 * [_mixinJsonxMethod description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function _mixinJsonxMethod(req, res) {

  function _stringifyJsonxError(err) {
    var plainObject = {};
    Object.getOwnPropertyNames(err).forEach(function (key) {
      plainObject[key] = err[key];
    });
    return JSON.stringify(plainObject);
  }

  function _handleJsonxError(err){
    var serializedErr;
    var jsonSerializedErr;

    try {
      serializedErr = _stringifyJsonxError(err);
      jsonSerializedErr = JSON.parse(serializedErr);
      if (!jsonSerializedErr.stack || !jsonSerializedErr.message) {
        jsonSerializedErr.message = err.message;
        jsonSerializedErr.stack = err.stack;
      }
      return jsonSerializedErr;
    }
    catch (unusedErr){
      return {name: err.name, message: err.message, stack: err.stack};
    }
  }

  /**
   * res.jsonx(data)
   *
   * Serve JSON (and allow JSONP if enabled in `req.options`)
   *
   * @param  {Object} data
   *
   * - - - - - - - - - - - - - - - - - -
   * WARNING: THIS IS DEPRECATED!
   * - - - - - - - - - - - - - - - - - -
   */
  res.jsonx = res.jsonx || function jsonx (data){

    var caller = jsonx.caller && jsonx.caller.name;

    // Get easy access to Sails app instance.
    var sails = req._sails;

    // Log a deprecation notice.
    sails.log.debug('***********************************************************************************');
    sails.log.debug('`res.jsonx()` is deprecated in Sails v1.0 and will be removed in a future release.');
    sails.log.debug(chalk.bold('Any files in `api/responses/` that haven\'t been customized can simply be removed.'));
    sails.log.debug(chalk.gray('Otherwise see http://sailsjs.com/upgrading for options to replace `res.jsonx()`.'));
    if (caller) {
      sails.log.debug(chalk.gray('(jsonx was called from `' + caller + '`)'));
    }
    sails.log.debug('***********************************************************************************');

    // Send conventional status message if no data was provided
    // (see http://expressjs.com/en/api.html#res.send)
    if (_.isUndefined(data)) {
      return res.status(res.statusCode).send();
    }
    else if (typeof data !== 'object') {
      // (note that this guard includes arrays, functions, and even `null`)
      return res.send(data);
    }

    // When responding with an Error instance, if it's going to get sringified into
    // a dictionary with no `.stack` or `.message` properties, add them in.
    if (data instanceof Error) {
      data = _handleJsonxError(data);
    }

    if ( req.options.jsonp && !req.isSocket ) {
      return res.jsonp(data);
    }
    else {
      return res.json(data);
    }
  };//ƒ
}//ƒ




// Note for later
// We could differentiate between 500 (generic error message)
// and 504 (gateway did not receive response from upstream server) which could describe an IO problem
// This is worth having a think about, since there are 2 fundamentally different kinds of "server errors":
// (a) An infrastructural issue, or 504  (e.g. MySQL database randomly crashed or Twitter is down)
// (b) Unexpected bug in app code, or 500 (e.g. `req.session.user.id`, but `req.session.user` doesn't exist)
//
// See the Sails project roadmap (sailsjs.com/roadmap) for future plans to better account for this.
