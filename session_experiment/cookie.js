var connect = require('connect');
	parseCookie = connect.utils.parseCookie;
	ConnectSession = connect.middleware.session.Session;
module.exports = parseCookie;