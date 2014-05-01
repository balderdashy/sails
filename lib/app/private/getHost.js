/**
 * Sails.prototype.getHost()
 *
 * @return {String} the configured hostname of the server
 * (IMPORTANT: returns undefined if not specifically configured)
 */

module.exports = function getHost() {
  var sails = this;

  var hasExplicitHost = sails.config.hooks.http && sails.config.explicitHost;
  var host = sails.config.proxyHost || hasExplicitHost || sails.config.host;
  return host;
};
