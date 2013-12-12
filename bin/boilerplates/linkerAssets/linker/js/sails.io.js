/**
 * sails.io.js
 *
 * This file is completely optional, and merely here for your convenience.
 *
 * It reduces the amount of browser code necessary to send and receive messages
 * to & from Sails by simulating a REST client interface on top of socket.io.
 * It models its API after the pattern in jQuery you might be familiar with.
 * 
 * So to switch from using AJAX to Socket.io, instead of:
 *    `$.post( url, [data], [cb] )`
 *
 * You would use:
 *    `socket.post( url, [data], [cb] )`
 *
 * For more information, visit:
 * http://sailsjs.org/#documentation
 */

(function (io) {


  // We'll be adding methods to `io.SocketNamespace.prototype`, the prototype for the 
  // Socket instance returned when the browser connects with `io.connect()`
  var Socket = io.SocketNamespace;



  /**
   * Simulate a GET request to sails
   * e.g.
   *    `socket.get('/user/3', Stats.populate)`
   *
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   */

  Socket.prototype.get = function (url, data, cb) {
    return this.request(url, data, cb, 'get');
  };



  /**
   * Simulate a POST request to sails
   * e.g.
   *    `socket.post('/event', newMeeting, $spinner.hide)`
   *
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   */

  Socket.prototype.post = function (url, data, cb) {
    return this.request(url, data, cb, 'post');
  };



  /**
   * Simulate a PUT request to sails
   * e.g.
   *    `socket.post('/event/3', changedFields, $spinner.hide)`
   *
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   */

  Socket.prototype.put = function (url, data, cb) {
    return this.request(url, data, cb, 'put');
  };



  /**
   * Simulate a DELETE request to sails
   * e.g.
   *    `socket.delete('/event', $spinner.hide)`
   *
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   */

  Socket.prototype['delete'] = function (url, data, cb) {
    return this.request(url, data, cb, 'delete');
  };




   /**
   * Simulate HTTP over Socket.io
   * @api private :: but exposed for backwards compatibility w/ <= sails@~0.8
   */

  Socket.prototype.request = request;
  function request (url, data, cb, method) {

    var socket = this;

    var usage = 'Usage:\n socket.' +
      (method || 'request') +
      '( destinationURL, dataToSend, fnToCallWhenComplete )';

    // Remove trailing slashes and spaces
    url = url.replace(/^(.+)\/*\s*$/, '$1');

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
    socket.emit(method, json, function afterEmitted (result) {

      var parsedResult = result;

      if (result && typeof result === 'string') {
        try {
          parsedResult = window.io.JSON.parse(result);
        } catch (e) {
          if (typeof console !== 'undefined') {
            console.warn("Could not parse:", result, e);
          }
          throw new Error("Server response could not be parsed!\n" + result);
        }
      }

      // TODO: Handle errors more effectively
      if (parsedResult === 404) throw new Error("404: Not found");
      if (parsedResult === 403) throw new Error("403: Forbidden");
      if (parsedResult === 500) throw new Error("500: Server error");

      cb && cb(parsedResult);

    });
  }
  



}) (

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);
