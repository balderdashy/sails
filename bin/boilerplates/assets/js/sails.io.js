/**
 * io.SocketNamespace.prototype.*
 *
 * Additional functionality for the Sails.js framework
 * Extends Socket.io socket object with some convenience methods
 *
 */


 /**
 *
 * Simulate an HTTP request to the backend
 *   @param {String} url    ::    the request label (usually the destination URL)
 *   @param {Object} data   ::    data to pass with the request
 *   @param {Object} options::    optional callback or config object
 *   @param {String} method ::    HTTP method (aka verb)
 *
 *
 * Note:  This should really be a private method, but it is
 *        exposed for backwards compatibility with Sails 0.8.x.
 *        The preferred usage in Sails v0.9+ is verb-based; e.g.,
 *          *-> `connectedSocket.get()`
 *          *-> `connectedSocket.post()`
 *          *-> `connectedSocket.put()`
 *          *-> `connectedSocket.delete()`
 */

io.SocketNamespace.prototype.request = function (url, data, options, method) {

  // Remove trailing slashes and spaces
  url = url.replace(/\/*\s*$/, '');

  // If url is empty, use /
  if (url === '') url = '/';

  // If options is a function, treat it as a callback
  // Otherwise the "success" property will be treated as the callback
  var cb;
  if (typeof options === 'function') cb = options;
  else cb = options.success;

  var json = io.JSON.stringify({
    url: url,
    data: data,
    method: method || 'get'
  });

  this.emit('message', json, function (result) {

    var parsedResult = result
    try {
      parsedResult = io.JSON.parse(result);
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.log("Could not parse:", result, e);
      }
      throw new Error("Server response could not be parsed!  " + result);
    }

    // TODO: Handle errors more effectively
    if (parsedResult === 404) throw new Error("404: Not found");
    if (parsedResult === 403) throw new Error("403: Forbidden");
    if (parsedResult === 500) throw new Error("500: Server error");

    cb(parsedResult);
  });
};

