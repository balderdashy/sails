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

  // Set req.port and req.baseUrl using the Host header and req.protocol
  //
  // We trust req.protocol to be set by Express. But Express only delivers
  // the host devoid of a port, so we have to delve into HTTP headers to pick
  // out the host port ourselves.
  var trustProxy = req.app && req.app.get('trust proxy') || false;
  var host;
  if (trustProxy) {
    host = (req.header && req.header('X-Forwarded-Host') || '').split(/,\s*/)[0];
  }
  host = host || (req.header && req.header('Host')) || 'could.not.determine.host';

  var protocol = req.protocol;
  var defaultPort;
  if (protocol == 'https' || protocol == 'wss') {
    defaultPort = 443;
  } else {
    defaultPort = 80;
  }
  var hostPort = parseInt(host.split(/:/)[1], 10) || defaultPort;

  req.port = hostPort;
  req.baseUrl = req.protocol + '://' + host;
};
