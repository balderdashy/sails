var request = require('request');
var fs = require('fs');

module.exports = {

  // Write routes object to router file
  writeRoutes: function(routes) {
    fs.writeFileSync('config/routes.js', 'module.exports.routes = ' + JSON.stringify(routes));
  },

  // Write routes object to blueprint config file
  writeBlueprint: function(config) {
    config = {
      blueprints: config
    };
    fs.writeFileSync('config/blueprints.js', 'module.exports = ' + JSON.stringify(config));
  },



  // Starts sails server, makes request, returns response, kills sails server
  testRoute: function(method, options, callback) {

    // Prefix url with domain:port
    if (typeof options === 'string') {
      options = {url: 'http://localhost:1342/' + options};
    } else {
      options.url = 'http://localhost:1342/' + options.url;
    }

    options.method = method == 'del' ? 'delete' : method;

    request(options, function(err, response, body) {
      if (err) return callback(err, response, body);
      callback(null, response, body);
    });

  }
};
