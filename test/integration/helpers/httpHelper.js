var request = require('@sailshq/request');
var fs = require('fs');


/**
 * Original test helpers
 *
 * TODO: refactor these into the other more modern set of test helpers.
 * (these are from waaaayyyy back)
 */

module.exports = {

  // Write specified routing config to the  `config/routes.js` file.
  writeRoutes: function(routesConfig) {
    fs.writeFileSync('config/routes.js', 'module.exports.routes = ' + JSON.stringify(routesConfig));
  },

  // Write specified blueprints config to the  `config/blueprints.js` file.
  writeBlueprint: function(blueprintsConfig) {
    fs.writeFileSync('config/blueprints.js', 'module.exports.blueprints = ' + JSON.stringify(blueprintsConfig));
  },


  // Make a request to an already-lifted Sails server running on port 1342.
  testRoute: function(method, options, callback) {

    // Prefix url with domain:port
    if (typeof options === 'string') {
      options = {url: 'http://localhost:1342/' + options};
    } else {
      options.url = 'http://localhost:1342/' + options.url;
    }

    options.method = (method === 'del') ? 'delete' : method;

    request(options, function(err, response, body) {
      if (err) {
        return callback(err, response, body);
      }

      return callback(null, response, body);
    });

  }
};
