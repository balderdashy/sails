/**
 * aggregateQueries.test.js
 *
 * This module tests aggregate CRUD operations:
 * createEach(), findOrCreateEach()
 *
 * Aggregate operations are special in that they accept a list of criteria/values
 * and then perform the CRUD operation using each value.
 * They are less efficient, but can be optimized by user adapters using db vendor-specific syntax
 * to squash the operations into a single query to the database;
 */
// Dependencies
var _ = require('underscore');
var async = require('async');
var parley = require('parley');
var assert = require("assert");

describe('findOrCreateEach()', function() {

	var testName = 'findOrCreateEach([])';
	var testData = [{
		name: 'marge',
		type: testName
	}, {
		name: 'richie',
		type: testName
	}, {
		name: Math.round(Math.random() * 10000),
		type: testName
	}, {
		name: Math.round(Math.random() * 10000),
		type: testName
	}, {
		name: Math.round(Math.random() * 10000),
		type: testName
	}, {
		name: Math.round(Math.random() * 10000),
		type: testName
	}];

	before(function(done) {
		User.create(testData, done);
	});

	it('should create new user(s) for the one that doesn\'t exist', function(cb) {

		User.findOrCreateEach(['type', 'name'], [{
			name: 'NOT IN THE SET',
			type: testName
		}], User.testCount(1, cb));
	});

	it('should create properly using shorthand', function(cb) {

		User.findOrCreateEach(['type', 'name'], [{
			name: 'ANOTHER ONE NOT IN THE SET',
			type: testName
		}], User.testCount(1, cb));
	});

	it('should NOT create new user(s) for the one that DOES exist', function(cb) {
		User.findOrCreateEach(['name'], [{
			name: 'richie',
			type: testName
		}, {
			name: 'marge',
			type: testName
		}], function(err, users) {
			cb();
		});
	});
	// it ('should find existing models properly using shorthand', function (cb) {
	// 	User.findOrCreateEach(['name'],[{
	// 		name: 'richie',
	// 		type: testName
	// 	}, {
	// 		name: 'marge'
	// 	}], User.testCount(2, cb));
	// });
});


describe('CRUD :: Aggreagate methods and transactions', function() {

	describe('overloaded usage of create', function() {

		var testName = 'test create a list';
		var testData = [{
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}];

		before(function(done) {
			User.create(testData, done);
		});

		it('should have saved the proper values (with auto-increment values)', function(done) {

			User.findAll({
				type: testName
			}, function(err, users) {
				if(err) done(new Error(err));
				else if(!pluckEqual(users, testData, 'name')) {
					done(new Error('Proper user names were not saved!'));
				} else if(!validAutoIncrementIds(users)) {
					done(new Error('Ids were not properly auto-incremented!'));
				} else done();
			});
		});
	});


	describe('createEach', function() {

		var testName = 'test createEach';
		var testData = [{
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}];

		it('should not fail', function(done) {
			User.createEach(testData, done);
		});

		it('should have saved the proper values (with auto-increment values)', function(done) {

			User.findAll({
				type: testName
			}, function(err, users) {
				if(err) done(new Error(err));
				else if(!pluckEqual(users, testData, 'name')) {
					done(new Error('Proper user names were not saved!'));
				} else if(!validAutoIncrementIds(users)) {
					done(new Error('Ids were not properly auto-incremented!'));
				} else done();
			});
		});
	});


	describe('findOrCreateEach', function() {

		var testName = 'test findOrCreateEach';
		var testData = [{
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}, {
			name: Math.round(Math.random() * 10000),
			type: testName
		}];


		it('should not fail', function(done) {
			User.findOrCreateEach(['name', 'type'], testData, done);
		});

		it('SHOULD fail when only one arg is specified', function(done) {
			User.findOrCreateEach(testData, function(err) {
				if(err) return done();
				else done("Should have failed, since no attributesToCheck arg was specified!");
			});
		});

		it('should have saved the proper values (with auto-increment values)', function(done) {
			User.findAll({
				type: testName
			}, function(err, users) {

				if(err) done(new Error(err));
				else if(!pluckEqual(users, testData, 'name')) {
					done(new Error('Proper user names were not saved!'));
				} else if(!validAutoIncrementIds(users)) {
					console.error(users, properAutoIncrementVals);
					done(new Error('Ids were not properly auto-incremented!'));
				} else done();

			});
		});

	});
});

// Check equality on two SETS of objects 
// using one particular attribute as a vector of comparison
function pluckEqual(listA, listB, attrName) {

	// Order doesn't matter
	return _.every(_.pluck(listA, attrName), function(item) {

		// Cast item to number if possible
		if (Math.pow(+item, 2) > 0) item = +item;

		return _.contains(_.pluck(listB, attrName), item);
	});

	// Order does matter:
	// return _.isEqual(_.pluck(listA, attrName),_.pluck(listB, attrName));
}
// Check that all new ids exist and are valid auto-increment vals


function validAutoIncrementIds(users) {
	return _.all(users, function(user) {
		return user.id && _.isFinite(user.id) && user.id > 0;
	});
}