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
require("../waterline.js") (adapters, models, function() {



	describe('#creating()', function() {

		it('a User named Johnny', function(done) {
			models.user.create({
				name: "Johnny"
			}, done);
		});

		it('a User named Timmy should return a generated PK', function(done) {
			models.user.create({
				name: "Timmy"
			}, function(err, timmy) {
				if(err) throw err;
				else if(!timmy || !timmy.name || timmy.name !== "Timmy") throw "Invalid model returned.";
				else if(!timmy.id) throw "No id returned.";
				else done(err, timmy);
			});
		});

		it('should mean we can fetch Johnny', function(done) {
			models.user.create({
				name: "Johnny"
			}, done);
		});

	});

	
});