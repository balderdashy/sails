/**
 * crud.test.js
 *
 * This module tests basic crud operations on the specified adapter.
 * Each operation occurs in series, one after another, so the purpose here
 * isn't to test concurrency ACID compliance, just functional correctness.
 *
 */
// Dependencies
var _ = require('underscore');
var parley = require('parley');
var assert = require("assert");


describe('adapter', function() {

	describe('#creating() users Johnny and Timmy', function() {

		it('should create Johnny', function(done) {
			User.create({
				name: "Johnny"
			}, done);
		});

		it('should return a generated PK', function(done) {
			User.create({
				name: "Timmy"
			}, function(err, timmy) {
				if(err) throw err;
				else if(!timmy || !_.isObject(timmy)) throw "Invalid model returned.";
				else if(!timmy.name || timmy.name !== "Timmy") throw new Error("Invalid name returned: "+timmy.name);
				else if(!timmy.id) throw "No id returned.";
				else done(err, timmy);
			});
		});

		it('should mean we can find Johnny', function(done) {
			User.find({
				name: "Johnny"
			}, function(err, user) {
				if(err) throw err;
				else if(!user || !_.isObject(user) || !user.name || user.name !== "Johnny") {
					throw new Error("Invalid model returned: "+user);
				}
				else if(!user.id) throw "No id returned.";
				else done(err, user);
			});
		});
	});


	describe('#updating() Johnny\'s name to Richard', function() {

		it('should work', function(done) {
			User.update({
				name: 'Johnny'
			}, {
				name: "Richard"
			}, done);
		});

		it('should mean we can find Richard', function(done) {
			User.find({
				name: "Richard"
			}, function(err, user) {

				if(err) throw err;
				else if(!user || !_.isObject(user) || !user.name || user.name !== "Richard") throw "Invalid model returned.";
				else done(err, user);
			});
		});

		it('should only result in a single Richard existing', function(done) {
			User.findAll({
				name: "Richard"
			}, function(err, users) {
				if(err) throw err;
				else if(users.length !== 1) throw "updating created extra collections!";
				else done(err, users);
			});
		});

		it('should still retain other fields in updated model', function(done) {
			User.find({
				name: "Richard"
			}, function(err, user) {

				if(err) throw err;
				else if(!user.id) throw "Id missing!";
				else done(err, user);
			});
		});
	});


	describe('#destroying() Richard', function() {

		it('should work', function(done) {
			User.destroy({
				name: 'Richard'
			}, done);
		});

		it('should mean trying to find Richard should return an empty array', function(done) {
			User.findAll({
				name: "Richard"
			}, function(err, users) {
				if(err) throw err;
				else if(!users || !_.isArray(users) || users.length > 0) throw "A non-empty list was returned!";
				else done(err, users);
			});
		});
	});


	describe('#destroying() Timmy', function() {

		it('should work', function(done) {
			User.destroy({
				name: 'Timmy'
			}, done);
		});

		it('should mean trying to find Timmy should return an empty array', function(done) {
			User.findAll({
				name: "Timmy"
			}, function(err, users) {
				if(err) throw err;
				else if(!users || !_.isArray(users) || users.length > 0) throw "A non-empty list was returned!";
				else done(err, users);
			});
		});
	});

	describe('#destroyAll()', function() {

		before(function(cb) {
			User.createEach([{
				type: 'dummy_test'
			}, {
				type: 'dummy_test'
			}, {
				type: 'dummy_test'
			}, {
				type: 'dummy_test'
			}], cb);
		});


		it('should remove all of the models', function(done) {

			User.destroyAll(function(err, users) {
				User.findAll(function(err, users) {
					if(err) throw err;
					else if(!users || !_.isArray(users)) throw new Error("An invalid result was returned!");
					else if(users.length > 0) throw new Error("A non-empty list was returned!");
					else done(err, users);
				});
			});

		});
	});

});