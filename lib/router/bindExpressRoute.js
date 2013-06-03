var async = require('async');
var _ = require('lodash');

module.exports = function(url, fn, httpVerb) {

	// Use all,get,post,put,or delete conditionally based on http verb
	// null === *any* of the HTTP verbs
	if(!httpVerb) {
		sails.express.app.all(url, fn);
	} else {
		_.isFunction(sails.express.app[httpVerb]) && sails.express.app[httpVerb](url, fn);
	}
};