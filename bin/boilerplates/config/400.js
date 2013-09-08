/**
 * Default 400 (bad request) handler
 *
 * Sails will respond using this handler when either:
 * (a) an unusable request hits the server
 * (b) or a blueprint is requested with missing or invalid parameters
 *
 * This handler can also be invoked manually with `res.badRequest()`
 *
 * `errors` is a set of errors, usually an array of validation errors.
 * `previous` is the URL of the previous page to redirect back to (only relevant for HTML requesters)
 *
 * Note: This handler works a bit differently from the others if the requester is expecting
 * an HTML response-- it will attempt to follow the best-practice of redirecting back to the page
 * where the bad request originated from, and populate a variable in the session ( req.flash('errors') )
 * with a semantic error object (what you'll probably want to use to render validation errors in your view).
 * However, if the source page cannot be determined, a 500 error page will be displayed instead indicating the situation.
 *
 * For requesters expecting JSON, everything works like you would expect-- a simple JSON response
 * indicating the 400: Bad Request status with relevant information will be returned. 
 *
 */

module.exports[400] = function badRequest(errors, previous, req, res) {

  var result = {
    status: 400
  };

  // Optional errors object
  if (errors) {
    result.errors = errors;
  }

  // If the user-agent wants a JSON response, send json
  if (req.wantsJSON) {
    return res.json(result, result.status);
  }

  // Otherwise, try to determine where the bad request originated
  if (previous) {
    sails.log('Got to previous');
    req.flash('errors', errors);
    sails.log('Got TO REDIRECT');
    return res.redirect(previous);
  }

  // If we can't figure out the source, run the `config/500.js` behavior and explain the situation
  // (in production mode, this is silenced)
  res.serverError(new Error('Bad request: Invalid input sent to server and previous page unknown.'));

};