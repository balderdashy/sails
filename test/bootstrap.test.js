var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");


module.exports = {

	// Initialize waterline
	init: initialize,

	teardown: teardown,

	// Override every collection's adapter with the specified adapter
	// Then return the init() method
	initWithAdapter: function (adapter) {
		_.map(module.exports.collections,function (collection) {
			collection.adapter = adapter;
		});
		return initialize;
	}
};

// Initialize waterline
function initialize (done) {
	// Keep a reference to waterline to use for teardown()
	module.exports.waterline = require("../waterline.js");

	var collections = require('../buildDictionary.js')(__dirname + '/collections', /(.+)\.js$/);

	module.exports.waterline({
		collections: collections,
		log: blackhole
	}, function (err, waterlineData){

		module.exports.adapters = waterlineData.adapters;
		module.exports.collections = waterlineData.collections;
		done(err);
	});
}

// Tear down adapters and collections
function teardown (done) {
	module.exports.waterline.teardown({
		adapters: module.exports.adapters,
		collections: module.exports.collections
	},done);
}

// Use silent logger for testing
// (this prevents annoying output from cluttering up our nice clean console)
var blackhole = function (){};