
/**
 * Module dependencies
 */

var npm = require('enpeem')
	, package = require('../package.json')
	, util = require('util')
	, _ = require('lodash');

modules = _.reduce(package.testDependencies, function (modules, version, name) {
	modules.push(name+'@'+version);
	return modules;
}, []);

console.log(
	'\n\n',
	'Ensuring test dependencies are installed...',
	'\n',
	util.format('(To skip this step next time, just run `%s` intead of `npm test`)', package.scripts.test),
	'\n\n');

npm.install(modules, {
	production: true,
	'cache-min': 999999999
}, function(err) {
	if (err) throw err;
	console.log(
		'\n\n',
		'Ready!',
		'\n',
		'Running tests...'
	);
});