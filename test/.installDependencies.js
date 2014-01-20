
/**
 * Module dependencies
 */

var npm = require('enpeem')
	, modules = require('../package.json').testDependencies
	, _ = require('lodash');

modules = _.reduce(modules, function (modules, version, name) {
	modules.push(name+'@'+version);
	return modules;
}, []);

npm.install(modules, {
	production: ''
}, function(err) {
	if (err) throw err;
	console.log('\n\n','Test dependencies installed!');
});