// Keep a reference to waterline to use for teardown()
var waterline = require("../waterline.js");
var adapters, collections;

var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");
var collections = require('../buildDictionary.js')(__dirname + '/collections', /(.+)\.js$/);


module.exports = {

	// Initialize waterline
	init: initialize,

	teardown: teardown,

	// Override every collection's adapter with the specified adapter
	// Then return the init() method
	initWithAdapter: function (adapter) {
		_.map(collections,function (collection) {
			collection.adapter = adapter;
		});
		return initialize;
	},

	collections: collections
};

// Initialize waterline
function initialize (done) {
	waterline({
		collections: collections,
		log: blackhole
	}, function (err, waterlineData){
		adapters = waterlineData.adapters;
		collections = waterlineData.collections;
		done(err);
	});
}

// Tear down adapters and collections
function teardown (done) {
	waterline.teardown({
		adapters: adapters,
		collections: collections
	},done);
}

// Use silent logger for testing
// (this prevents annoying output from cluttering up our nice clean console)
var blackhole = function (){};