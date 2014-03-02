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

	// Access to server port, if available
	var nodeHTTPServer = req._sails.hooks.http.server;
	var nodeHTTPServerAddress = (nodeHTTPServer && nodeHTTPServer.address()) || {};
	req.port = req.port || (nodeHTTPServerAddress && nodeHTTPServerAddress.port) || 80;

	// Add access to full base url for convenience
	req.baseUrl = req.protocol + '://' + req.host + (req.port == 80 || req.port == 443 ? '' : ':' + req.port);
};