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

// Bootstrap waterline and get access to User collection
var bootstrap = require('./bootstrap.test.js');
var User;

module.exports = function(adapter) {

	describe('adapter', function() {

		// Bootstrap waterline with default adapters and bundled test collections
		before(bootstrap.initWithAdapter(adapter));

		// Get User object ready to go before each test
		beforeEach(function () {
			return User = bootstrap.collections.user;
		});

		describe('#creating() users Johnny and Timmy', function() {

			it('should work', function(done) {
				User.create({
					name: "Johnny"
				},done);
			});

			it('should return a generated PK', function(done) {
				User.create({
					name: "Timmy"
				}, function(err, timmy) {
					if(err) throw err;
					else if(!timmy || !_.isObject(timmy)) throw "Invalid model returned.";
					else if(!timmy.name || timmy.name !== "Timmy") throw "Invalid name returned.";
					else if(!timmy.id) throw "No id returned.";
					else done(err, timmy);
				});
			});

			it('should mean we can find Johnny', function(done) {
				User.find({
					name: "Johnny"
				}, function(err, users) {
					// Get first item from result set
					var user = users[0];

					if(err) throw err;
					else if(!user || !_.isObject(user) || !user.name || user.name !== "Johnny") throw "Invalid model returned.";
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
				}, function(err, users) {
					// Get first item from result set
					var user = users[0];

					if(err) throw err;
					else if(!user || !_.isObject(user) || !user.name || user.name !== "Richard") throw "Invalid model returned.";
					else done(err, user);
				});
			});

			it('should only result in a single Richard existing', function(done) {
				User.find({
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
				}, function(err, users) {
					// Get first item from result set
					var user = users[0];

					if(err) throw err;
					else if(!user.id) throw "Id missing!";
					else done(err, users);
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
				User.find({
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
				User.find({
					name: "Timmy"
				}, function(err, users) {
					if(err) throw err;
					else if(!users || !_.isArray(users) || users.length > 0) throw "A non-empty list was returned!";
					else done(err, users);
				});
			});
		});

	});
};