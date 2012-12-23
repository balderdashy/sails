/**
 * transactions.test.js
 *
 * This module tests basic CRUD operations on the specified adapter, but in parallel.
 * It simulates simultaneous access to models in the same collection, and then models at the same time.
 * It tests manual app-level locks/mutices, and also the built in atomic operations:
 * autoIncrement(), findOrCreate(), findAndUpdate(), findAndDestroy()
 */
module.exports = function(adapter) {

	// Dependencies
	var _ = require('underscore');
	var parley = require('parley');
	var assert = require("assert");

	// Get test adapters and models
	var models = {
		user: require('./models/User.js')
	};
	var adapters = {};
	adapters[adapter.identity] = adapter;
	models.user.adapter = adapter.identity;

	// Bootstrap waterline
	require("../waterline.js")({
		adapters: adapters,
		collections: models
	}, function() {

		describe('Setup :: #creating() users Johnny and Timmy', function() {

			it('should work', function(done) {
				models.user.create({
					name: "Johnny"
				}, done);

				models.user.create({
					name: "Timmy"
				}, done);
			});

		});

	});
};