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
    req.flash('errors', errors);
    return res.redirect(previous);
  }

  // TODO: Depending on your app's needs, you may choose to look
  // at the Referer header here and redirect back. Please do so at your own risk!
  // For security reasons, Sails does not provide this affordance by default.

  // If the origin (previous page) was not specified, just respond w/ JSON
  return res.json(result, result.status);

};