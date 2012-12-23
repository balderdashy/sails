var routes;
try {
	routes = require(sails.config.appPath + '/routes') || {};
}
catch (e) {
	routes = {};
}
module.exports = routes;