/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');

/**
 * Give Waterline UsageErrors from blueprints a toJSON function for nicer output.
 */

module.exports = function(err, req) {

  err.toJSON = function (){
    // Include the error code and the array of RTTC validation errors
    // for easy programmatic parsing.
    var jsonReadyErrDictionary = _.pick(err, ['code', 'details']);
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

  };//</define :: err.toJSON()>

  return err;

};
