// /**
// * run.test.js
// *
// * Start script for tests
// *
// *
// */

// // Dependencies
// var _ = require('underscore');
// var parley = require('parley');
// var assert = require("assert");
// var buildDictionary = require('../buildDictionary.js');
// var bootstrap = require('./bootstrap.test.js');

// describe('waterline', function() {

// 	// Bootstrap waterline with default adapters and bundled test collections
// 	before(bootstrap.init);

// 	runSuite('init');
// 	// runSuite('DirtyAdapter');
// 	runSuite('transactions');
// 	runSuite('crud.transactions');
// 	runSuite('definitions');

// 	// When this suite of tests is complete, shut down waterline to allow other tests to run without conflicts
// 	after(bootstrap.teardown);
// });

// function runSuite(label) {
// 	describe (label, function () {
// 		require('./'+label+'.test.js')(bootstrap);
// 	});
// }