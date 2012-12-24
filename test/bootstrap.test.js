var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");
var waterline = require('../waterline');
var collections = require('../buildDictionary.js')(__dirname + '/collections', /(.+)\.js$/);

module.exports = {

	// Initialize waterline
	init: initialize,

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
function initialize (exit) {
	require("../waterline.js")({
		collections: collections,
		log: blackhole
	}, exit);
}

// Use silent logger for testing
// (this prevents annoying output from cluttering up our nice clean console)
var blackhole = function (){};