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


describe('CRUD :: Aggreagate methods and transactions', function (){
	describe ('createEach',function () {

		var testName = 'test createEach';
		var testData = [
			{name: ''+Math.round(Math.random()*10000), type: testName},
			{name: ''+Math.round(Math.random()*10000), type: testName},
			{name: ''+Math.round(Math.random()*10000), type: testName},
			{name: ''+Math.round(Math.random()*10000), type: testName}
		];

		it ('should not fail',function (done) {
			User.createEach(testData,done);
		});

		it ('should have saved the proper values (with auto-increment values)',function (done) {
			
			User.findAll({type: testName},function (err,users) {
				if (err) done(new Error(err));
				else if (!pluckEqual(users,testData, 'name')) {
					done(new Error ('Proper user names were not saved!')); 
				}
				else if (!validAutoIncrementIds(users)) {
					done(new Error ('Ids were not properly auto-incremented!')); 
				}
				else done();
			});
		});		
	});


	describe ('findOrCreateEach',function () {

		var testName = 'test findOrCreateEach';
		var testData = [
			{name: ''+Math.round(Math.random()*10000), type: testName},
			{name: ''+Math.round(Math.random()*10000), type: testName},
			{name: ''+Math.round(Math.random()*10000), type: testName},
			{name: ''+Math.round(Math.random()*10000), type: testName}
		];


		it ('should not fail',function (done) {
			User.findOrCreateEach(testData,done);
		});

		it ('should have saved the proper values (with auto-increment values)',function (done) {
			User.findAll({type: testName},function (err,users) {
				console.log("users",users);
				console.log("testData",testData);
				if (err) done(new Error(err));
				else if (!pluckEqual(users,testData, 'name')) {
					done(new Error ('Proper user names were not saved!')); 
				}
				else if (!validAutoIncrementIds(users)) {
					console.error(users,properAutoIncrementVals);
					done(new Error ('Ids were not properly auto-incremented!')); 
				}
				else done();
			});
		});
		
	});
});

// Check equality on two SETS of objects 
// using one particular attribute as a vector of comparison
function pluckEqual(listA, listB, attrName) {
	// Order doesn't matter
	return _.every(_.pluck(listA, attrName), function (item) {
		return _.contains(_.pluck(listB, attrName),item);
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