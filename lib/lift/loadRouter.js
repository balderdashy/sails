var async = require('async');
var _ = require('lodash');
var Router = require('../router');

// Map Routes
// Link Express HTTP requests to a function which handles them
// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
module.exports = function (cb) {
	sails.log.verbose('Loading router...');

	Router.listen(function(url, fn, httpVerb) {
		// Use all,get,post,put,or delete conditionally based on http verb
		// null === *any* of the HTTP verbs
		if(!httpVerb) {
			sails.express.app.all(url, fn);
		} else {
			_.isFunction(sails.express.app[httpVerb]) && sails.express.app[httpVerb](url, fn);
		}
	});

	cb();
};