
/**
 * Module dependencies
 */

var npm = require('enpeem')
	, package = require('../package.json')
	, util = require('util')
	, _ = require('lodash')
	, log = require('captains-log')();

// Get dependency versions
modules = _.reduce(package.testDependencies, function (modules, version, name) {
	modules.push(name+'@'+version);
	return modules;
}, []);


console.log('\n\n');
log('Ensuring test dependencies are installed...');
log.info((util.format('(To skip this step next time, just run `%s` intead of `npm test`)', package.scripts.test)));
console.log('');

// Install dependencies
npm.install(modules, {
	production: true,
	'cache-min': 999999999
}, function(err) {
	if (err) {
		log.error(err);
		throw err;
	}

	console.log('\n');
	log('Ready!');
	log.info('Running tests...');
});