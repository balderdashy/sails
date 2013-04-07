// Dependencies
var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");

var bootstrap = {

	// Initialize waterline
	init: initialize,

	teardown: teardown,

	// Override every collection's adapter with the specified adapter
	// Then return the init() method
	initWithAdapter: function (adapter) {
		_.map(bootstrap.collections,function (collection) {
			collection.adapter = adapter;
		});
		return initialize;
	}
};


// Bootstrap waterline with default adapters and bundled test collections
before(bootstrap.init);

// When this suite of tests is complete, shut down waterline to allow other tests to run without conflicts
after(bootstrap.teardown);


// Initialize waterline
function initialize (done) {
	// Keep a reference to waterline to use for teardown()
	bootstrap.waterline = require("../../lib/waterline");

	var collections = require('../../lib/loader').required({
		dirname		: __dirname + '/fixtures/collections', 
		filter		: /(.+)\.js$/
	});

	bootstrap.waterline({
		collections: collections,
		appPath: __dirname + "/../../",
		log: blackhole
	}, function (err, waterlineData){

		bootstrap.adapters = waterlineData.adapters;
		bootstrap.collections = waterlineData.collections;

		done(err);
	});
}

// Tear down adapters and collections
function teardown (done) {
	bootstrap.waterline.teardown(done);
}

// Use silent logger for testing
// (this prevents annoying output from cluttering up our nice clean console)
var blackhole = _.extend(function () {},{
	verbose: function (){},
	info: function (){},
	debug: function (){},
	warn: function (){},
	error: function (){}
});