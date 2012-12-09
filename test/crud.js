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

// Bootstrap waterline
require("../waterline.js")(adapters, models, function() {

	describe('#creating() users Johnny and Timmy', function() {

		it('should work', function(done) {
			models.user.create({
				name: "Johnny"
			}, done);
		});

		it('should return a generated PK', function(done) {
			models.user.create({
				name: "Timmy"
			}, function(err, timmy) {
				if(err) throw err;
				else if(!timmy || !_.isObject(timmy)) throw "Invalid model returned.";
				else if (!timmy.name || timmy.name !== "Timmy") throw "Invalid name returned.";
				else if(!timmy.id) throw "No id returned.";
				else done(err, timmy);
			});
		});

		it('should mean we can find Johnny', function(done) {
			models.user.find({
				name: "Johnny"
			}, function (err,user) {
				if(err) throw err;
				else if(!user || !_.isObject(user) || !user.name || user.name !== "Johnny") throw "Invalid model returned.";
				else if(!user.id) throw "No id returned.";
				else done(err, user);
			});
		});

	});


});