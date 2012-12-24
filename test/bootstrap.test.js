var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");
var waterline = require('../waterline');

module.exports = {

	waterline: waterline,

	init: function (cb) {
		var $ = new parley();
		var collections = require('../buildDictionary.js')(__dirname + '/collections', /(.+)\.js$/);
		var outcome = $(require("../waterline.js"))({
			collections: collections
		});
		$(done)(outcome);
	}
};