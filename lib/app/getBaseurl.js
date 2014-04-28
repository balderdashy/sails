/**
 * Calculate the base URL
 * @return {String} [description]
 */
module.exports = function getBaseurl() {
  var sails = this;

  var usingSSL = sails.config.ssl && sails.config.ssl.key && sails.config.ssl.cert;
  var localAppURL =
    (usingSSL ? 'https' : 'http') + '://' +
    (sails.getHost() || 'localhost') +
    (sails.config.port == 80 || sails.config.port == 443 ? '' : ':' + sails.config.port);

  return localAppURL;
};
