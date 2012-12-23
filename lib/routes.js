/**
* Read url mappings from routes.js
*/
try {
	module.exports = require(sails.config.appPath + '/routes') || {};
}
catch (e) {
	module.exports = {};
}