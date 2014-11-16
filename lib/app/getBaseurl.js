/**
 * Calculate the base URL
 * @return {String} [description]
 */
module.exports = function getBaseurl() {
  var sails = this;

  var usingSSL = sails.config.ssl && sails.config.ssl.key && sails.config.ssl.cert;
  var host = sails.getHost() || 'localhost';
  var port = sails.config.proxyPort || sails.config.port;
  if (!~host.indexOf('http')) {
    host = (usingSSL || port == 443 ? 'https' : 'http') + '://' + host;
  }
  var localAppURL =
    host +
    (port == 80 || port == 443 ? '' : ':' + port);

  return localAppURL;
};
