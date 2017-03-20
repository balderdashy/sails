/**
 * Action which grants a CSRF token to the requestor.
 */
module.exports = function grantCsrfToken (req, res /*, next */) {
  // Don't grant CSRF tokens over sockets.
  if (req.isSocket) {
    if (process.env.NODE_ENV === 'production') {
      return res.notFound();
    }
    return res.badRequest(new Error('Cannot access CSRF token via socket request.  Instead, send an HTTP request (i.e. XHR) to this endpoint.'));
  }
  // Send the CSRF token wrapped in an object.
  return res.json({
    _csrf: res.locals._csrf
  });
};
