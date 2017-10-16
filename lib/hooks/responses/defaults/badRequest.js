/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');



/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(data);
 *
 * e.g.:
 * ```
 * return res.badRequest(
 *   'Please choose a valid `password` (6-12 characters)',
 *   'trial/signup'
 * );
 * ```
 */

module.exports = function badRequest(data) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // Log error to console
  if (!_.isUndefined(data)) {
    sails.log.verbose('Sending 400 ("Bad Request") response: \n', data);
  }

  // Set status code
  res.status(400);

  // If no data was provided, use res.sendStatus().
  if (_.isUndefined(data)) {
    return res.sendStatus(400);
  }

  if (_.isError(data)) {

    // Give Waterline UsageErrors from blueprints a toJSON function for nicer output.
    if (
      !_.isUndefined(_.get(req, 'options.blueprintAction')) &&
      data.name === 'UsageError' &&
      !_.isFunction(data.toJSON) &&
      !_.isUndefined(data.details)
    ) {

      data.toJSON = function (){
        // Include the error code and the array of RTTC validation errors
        // for easy programmatic parsing.
        var jsonReadyErrDictionary = _.pick(data, ['code', 'details']);
        // And also include a more front-end-friendly version of the error message.
        var preamble =
        'The server could not fulfill this request (`'+req.method+' '+req.path+'`) '+
        'due to a problem with the parameters that were sent.  See the `details` for more info.';

        // If NOT running in production, then provide additional details and tips.
        if (process.env.NODE_ENV !== 'production') {
          jsonReadyErrDictionary.message = preamble+'  '+
          '**The following additional tip will not be shown in production**:  '+
          'Tip: Check your client-side code to make sure that the request data it '+
          'sends matches the expectations of the corresponding attribues in your '+
          'model.  Also check that your client-side code sends data for every required attribute.';
        }
        // If running in production, use a message that is more terse.
        else {
          jsonReadyErrDictionary.message = preamble;
        }
        //>-

        return jsonReadyErrDictionary;

      };//</define :: data.toJSON()>

    }

    // If the data is an Error instance and it doesn't have a custom .toJSON(),
    // then util.inspect() it instead (otherwise res.json() will turn it into an empty dictionary).
    // > Note that we don't do this in production, since (depending on your Node.js version) inspecting
    // > the Error might reveal the `stack`.  And since `res.badRequest()` could certainly be used in
    // > production, we wouldn't want to inadvertently dump a stack trace.
    if (!_.isFunction(data.toJSON)) {
      if (process.env.NODE_ENV === 'production') {
        return res.sendStatus(400);
      }
      // No need to JSON stringify (this is already a string).
      return res.send(util.inspect(data));
    }
  }
  return res.json(data);

};
