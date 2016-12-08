/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');


/**
 * _mixinServerMetadata()
 *
 * Set server metadata on the specified `req`, mutating it in-place.
 * (Host, port, etc.)
 *
 * This is for ALL requests, virtual or not.
 *
 * @param {Request} req
 *
 * @api private
 */

module.exports = function _mixinServerMetadata(req) {

  // Get reference to `sails` (Sails app instance) for convenience.
  var sails = req._sails;

  // FUTURE: bring this back, probably.
  // (but note that it wasn't actually being used anyway as of Sails v0.12-- was being overridden below)
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // // Access to server port, if available
  // if (sails.hooks.http) {
  //   var nodeHTTPServer = sails.hooks.http.server;
  //   var nodeHTTPServerAddress = (nodeHTTPServer && nodeHTTPServer.address && nodeHTTPServer.address()) || {};
  //   req.port = req.port || (nodeHTTPServerAddress && nodeHTTPServerAddress.port) || 80;
  // }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // Set req.port and req.baseUrl using the Host header and req.protocol
  //
  // We trust req.protocol to be set by Express when "trust proxy" is enabled.
  // But Express only delivers the host devoid of a port, so we have to delve into
  // HTTP headers to pick out the host port ourselves.
  //
  // FUTURE: revisit this ^^
  var trustProxy;
  if (req.app && req.app.get('trust proxy')) {
    trustProxy = req.app.get('trust proxy');
  }
  else if (sails.hooks.http && sails.config.http.trustProxy) {
    // If this is a virtual request, then "trust proxy" will not have been set
    // on the current `req.app`, but we still want to consider this the same case
    // if the sails.config.http.trustProxy was enabled.
    trustProxy = sails.config.http.trustProxy;
  }
  else {
    trustProxy = false;
  }


  if (!_.isFunction(req.get)) {
    throw new Error('Consistency violation: At this point (in the request hook), req.get() should always exist as a function.');
  }

  // Determine host.
  var host = '';
  var xForwardedHostHeader = req.get('X-Forwarded-Host');
  var hostHeader = req.get('Host');
  if (trustProxy && xForwardedHostHeader) {
    // FUTURE: use hostname-- because if trustProxy was configured, it means that we should be able to (as of E4)
    host = xForwardedHostHeader.split(/,\s*/)[0];
  }
  else if (hostHeader) {
    host = hostHeader;
  }
  else {
    host = 'could.not.determine.host';
  }


  // Determine host port
  // (FUTURE: come back to this, esp insofar as it affects virtual requests -- we need to respect trustProxy)
  var defaultPort;
  if (req.protocol === 'https' || req.protocol === 'wss') {
    defaultPort = 443;
  } else {
    defaultPort = 80;
  }
  var hostPort = parseInt(host.split(/:/)[1], 10) || defaultPort;
  req.port = hostPort;

  // Determine appropriate baseUrl
  // (FUTURE: come back to this, esp insofar as it affects virtual requests -- we need to respect trustProxy)
  req.baseUrl = req.protocol + '://' + host;

};
