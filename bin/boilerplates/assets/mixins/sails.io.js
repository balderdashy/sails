/************************************************************ 
 *
 * Additional functionality for the Sails.js framework
 *
 * Simulate an HTTP request to the backend
 *   url:   the request label (usually the destination URL)
 *   data:  data to pass with the request
 *   options:  optional callback or config object
 *   method:  HTTP method
 */
SocketNamespace.prototype.request = function (url, data, options, method) {
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
}
/*
 *
 ************************************************************/