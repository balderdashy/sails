/**
* Read url mappings from routes.js
*/
var routeConfigModuleName = 'routes.js';

try {
	module.exports = require(sails.config.appPath + '/' + routeConfigModuleName) || {};
}
catch (e) {
	module.exports = {};
}