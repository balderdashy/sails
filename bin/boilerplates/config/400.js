/**
 * Default 400 (bad request) handler
 *
 * Sails will respond using this handler when either:
 * (a) an unusable request hits the server
 * (b) or a blueprint is requested with missing or invalid parameters
 *
 * This handler can also be invoked manually with `res.badRequest()`
 *
 * Typically, this handler is used to hand back validation errors to the client.
 *
 * Note: This handler works a bit differently from the others if the requester is expecting
 * an HTML response-- it will attempt to follow the best-practice of redirecting back to the page
 * where the bad request originated from, and set a flag in the session (req.session.flash)
 * with a semantic error object (what you'll probably want to use to render validation errors in your view).
 * However, if the source page cannot be determined, a simple error page will be displayed instead.
 *
 * For requesters expecting JSON, everything works like you would expect-- a simple JSON response
 * indicating the 400: Bad Request status with relevant information will be returned. 
 *
 */

module.exports[400] = function badRequest(req, res) {

  var result = {
    status: 400
  };

  // If the user-agent wants a JSON response, send json
  if (req.wantsJSON) {
    return res.json(result, result.status);
  }

  // Otherwise, try to determine where the bad request originated
  // TODO

  // If we can't figure out the source, serve the `views/500.*` page
  var view = '500';
  res.status(result.status).render(view, result, function (err) {
    if (err) return res.send(err, result.status);
    res.render(view);
  });

};