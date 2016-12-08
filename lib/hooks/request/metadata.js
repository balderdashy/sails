/**
 * _mixinServerMetadata()
 *
 * Set server metadata on the specified virtual `req`, mutating it in-place.
 * (Host, port, etc.)
 *
 * @param {Request} req
 *
 * @api private
 */

module.exports = function _mixinServerMetadata(req) {

  // Get reference to `sails` (Sails app instance) for convenience.
  var sails = req._sails;

  // FUTURE: try to use `sockets` if `http` is not available
  // (currently, this function does not run for socket requests--
  // only for virtual requests-- these functions are added in the
  // socket hook.  Eventually, it would be better if as much of
  // that logic as possible was normalized in one place here.)

  // Access to server port, if available
  if (sails.hooks.http) {
    var nodeHTTPServer = sails.hooks.http.server;
    var nodeHTTPServerAddress = (nodeHTTPServer && nodeHTTPServer.address && nodeHTTPServer.address()) || {};
    req.port = req.port || (nodeHTTPServerAddress && nodeHTTPServerAddress.port) || 80;
  }

  // Set req.port and req.baseUrl using the Host header and req.protocol
  //
  // We trust req.protocol to be set by Express when "trust proxy" is enabled.
  // But Express only delivers the host devoid of a port, so we have to delve into
  // HTTP headers to pick out the host port ourselves.
  var trustProxy;
  if (req.app && req.app.get('trust proxy')) {
    trustProxy = req.app.get('trust proxy');
  }
  else if (sails.hooks.http && sails.config.http.trustProxy) {
    trustProxy = sails.config.http.trustProxy;
  }
  else {
    trustProxy = false;
  }

  var host;
  if (trustProxy) {
    host = (req.header && req.header('X-Forwarded-Host') || '').split(/,\s*/)[0];
  }
  host = host || (req.header && req.header('Host')) || 'could.not.determine.host';

  var protocol = req.protocol;
  var defaultPort;
  if (protocol === 'https' || protocol === 'wss') {
    defaultPort = 443;
  } else {
    defaultPort = 80;
  }
  var hostPort = parseInt(host.split(/:/)[1], 10) || defaultPort;

  req.port = hostPort;
  req.baseUrl = req.protocol + '://' + host;

};
