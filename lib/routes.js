var _ = require("underscore");

/**
* Read url mappings from routes.js
*/
var routeConfigModuleName = 'routes.js';

try {
	module.exports = _.extend({},require(sails.config.appPath + '/' + routeConfigModuleName));
}
catch (e) {
	module.exports = {};
}