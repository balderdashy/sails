/**
 * sails.io.js
 *
 * Additional functionality for the Sails.js framework
 * Extends Socket.io socket object with some convenience methods
 *
 * window.io.SocketNamespace.prototype is used to make socket.io's live connected sockets.
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

window.io.SocketNamespace.prototype.request = function (url, data, cb, method) {

  var usage = 'Usage:\n socket.' +
    (method || 'request') +
    '( destinationURL, dataToSend, fnToCallWhenComplete )';

  // Remove trailing slashes and spaces
  url = url.replace(/\/*\s*$/, '');

  // If method is undefined, use 'get'
  method = method || 'get';


  if ( typeof url !== 'string' ) {
    throw new Error('Invalid or missing URL!\n' + usage);
  }

  // Allow data arg to be optional
  if ( typeof data === 'function' ) {
    cb = data;
    data = {};
  }

  // Build to request
  var json = window.io.JSON.stringify({
    url: url,
    data: data
  });


  // Send the message over the socket
  this.emit(method, json, function afterEmitted (result) {

    var parsedResult = result;
    try {
      parsedResult = window.io.JSON.parse(result);
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.warn("Could not parse:", result, e);
      }
      throw new Error("Server response could not be parsed!\n" + result);
    }

    // TODO: Handle errors more effectively
    if (parsedResult === 404) throw new Error("404: Not found");
    if (parsedResult === 403) throw new Error("403: Forbidden");
    if (parsedResult === 500) throw new Error("500: Server error");

    cb && cb(parsedResult);
  });
};



/**
 * Simulate a GET request to the backend
 *   @param {String} url    ::    the request label (usually the destination URL)
 *   @param {Object} data   ::    data to pass with the request
 *   @param {Function} cb   ::    optional callback
 */

window.io.SocketNamespace.prototype.get = function (url, data, cb) {
  return this.request(url, data, cb, 'get');
};

window.io.SocketNamespace.prototype.post = function (url, data, cb) {
  return this.request(url, data, cb, 'post');
};

window.io.SocketNamespace.prototype.put = function (url, data, cb) {
  return this.request(url, data, cb, 'put');
};

window.io.SocketNamespace.prototype['delete'] = function (url, data, cb) {
  return this.request(url, data, cb, 'delete');
};
