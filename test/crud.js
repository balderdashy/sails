// Dependencies
var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");

// Get test adapters and models
var adapters = {
	dirty: require('./adapters/DirtyAdapter.js')
};
var models = {
	user: require('./models/User.js')
};


describe('adapter', function() {
	describe('#create()', function() {
		it('should instantiate w/o errors', function(done) {
			var $ = new parley();
			var outcome = $(require("../waterline.js")) (adapters,models);
			$(done)(outcome);
		});

		it('should create a model which can be fetched', function(done) {
			require("../waterline.js")(adapters,models,function () {
				models.user.create({
					name: "Johnny"
				},done);
			});
		});
	});
});