/**
 * Module dependencies
 */

var buildOutletFunction = require('../helpers/build-outlet-function');



/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * return res.notFound(err);
 * return res.notFound(err, 'some/specific/notfound/view');
 *
 * e.g.:
 * ```
 * return res.notFound();
 * ```
 *
 * NOTE:
 * If a request doesn't match any explicit routes (i.e. `config/routes.js`)
 * or route blueprints (i.e. "shadow routes", Sails will call `res.notFound()`
 * automatically.
 */

module.exports = function notFound (data, options) {

  var config = {
    logMessage: 'Sending 404 ("Not Found") response',
    statusCode: 404,
    logData: true,
    isError: true,
    isGuessView: false,
    name: 'notFound'
  };

  buildOutletFunction(this.req, this.res, data, options, config);

};
