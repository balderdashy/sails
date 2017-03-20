/**
 * Module dependencies
 */

var url = require('url');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var util = require('util');


/**
 * checkOriginUrl()
 *
 * @param {String} originUrl
 *        The origin URL to check.
 *        (This is used when parsing the relevant config from within `sails.config.security`
 *         or `sails.config.sockets`.)
 *
 * @throws {Error} if not valid
 *   @property {String} code  (==='E_INVALID')
 */

module.exports = function checkOriginUrl(originUrl) {

  if (!_.isString(originUrl) || originUrl === '') {
    throw flaverr('E_INVALID', new Error('Must specify a non-empty string, but instead got: '+util.inspect(originUrl, {depth: null})));
  }

  if (!originUrl.match(/^https?:\/\//)) {
    throw flaverr('E_INVALID', new Error('Must specify a protocol like http:// or https://, but instead got: '+originUrl));
  }

  // Now do a mostly-correct parse of the URL.
  var parsedOriginUrl = url.parse(originUrl);

  var isHttps = parsedOriginUrl.protocol === 'https:';

  if (isHttps && parsedOriginUrl.port === '443') {
    throw flaverr('E_INVALID', new Error('Should not explicitly specify port 443 with https:// (it is implied).  But instead got: '+originUrl));
  }
  if (!isHttps && parsedOriginUrl.port === '80') {
    throw flaverr('E_INVALID', new Error('Should not explicitly specify port 80 with https:// (it is implied).  But instead got: '+originUrl));
  }

  // Ensure there is no path or query string or fragment or anything like that.
  if (parsedOriginUrl.pathname !== '/' || parsedOriginUrl.path !== '/') {
    throw flaverr('E_INVALID', new Error('Should not specify a path, query string, URL fragment, or anything like that (but instead, got `'+originUrl+'`)'));
  }

  // Ensure there is no trailing slice
  var lastCharacter = originUrl.slice(-1);
  if (lastCharacter === '/') {
    throw flaverr('E_INVALID', new Error('Should not specify a trailing slash, but instead got: '+originUrl));
  }

};
