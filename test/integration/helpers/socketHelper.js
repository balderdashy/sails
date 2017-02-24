var fs = require('fs');

module.exports = {

  // Write routes object to blueprint config file
  writeModelConfig: function(config) {
    fs.writeFileSync('config/models.js', 'module.exports.models = {autosubscribe: [], connection: "localDiskDb"}');
  },

  // Starts sails server, makes request, returns response, kills sails server
  testRoute: function(socket, method, options, callback) {

    var url, data = {};
    // Prefix url with domain:port
    if (typeof options === 'string') {
      url = options;
    } else {
      url = options.url;
    }

    if (method === 'get') {
      socket[method](url, function(response) {
        callback(null, response);
      });
    }

    else {
      socket[method](url, data, function(response) {
        callback(null, response);
      });
    }

  }
};
