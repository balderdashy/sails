/**
 * Host, port, etc.
 * (fails silently if http or sockets is not enabled)
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

module.exports = function _mixinServerMetadata(req, res) {

	// TODO: try to use `sockets` if `http` is not available
	// (currently, this function does not run for socket requests--
	// these functions are added in the socket hook.  Eventually,
	// it would be better if that logic was normalized here, makes
	// us get all DRY or something.)

	// Access to server port, if available
  if (req._sails.hooks.http) {
    var nodeHTTPServer = req._sails.hooks.http.server;
    var nodeHTTPServerAddress = (nodeHTTPServer && nodeHTTPServer.address && nodeHTTPServer.address()) || {};
    req.port = req.port || (nodeHTTPServerAddress && nodeHTTPServerAddress.port) || 80;
  }

	// Add access to full base url for convenience
	// Resolving Issue #1586
	req.port = req.headers.port ? req.headers.port : req.port;
	req.host = req.headers.host ? req.headers.host : req.host;
	req.protocol = req.headers.protocol ? req.headers.protocol : req.protocol;

	req.baseUrl = req.protocol + '://' + req.host + (req.port == 80 || req.port == 443 ? '' : ':' + req.port);
};
