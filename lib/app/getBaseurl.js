/**
 * Module dependencies
 */

var _ = require ('lodash');




/**
 * Calculate the base URL (useful in emails, etc.)
 * @return {String} [description]
 */

module.exports = function getBaseurl() {
  var sails = this;

  var usingSSL = sails.config.ssl && sails.config.ssl.key && sails.config.ssl.cert;
  var host = sails.getHost() || 'localhost';
  var port = sails.config.proxyPort || sails.config.port;
  var probablyUsingSSL = (port === 443);

  // If host doesn't contain `http*` already, include the protocol string.
  var protocolString = '';
  if (!_.contains(host,'http')) {
    protocolString = ((usingSSL || probablyUsingSSL) ? 'https' : 'http') + '://';
  }
  var portString = (port === 80 || port === 443 ? '' : ':' + port);
  var localAppURL = protocolString + host + portString;

  return localAppURL;
};
