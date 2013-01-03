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
			{name: Math.round(Math.random()*10000), type: testName},
			{name: Math.round(Math.random()*10000), type: testName},
			{name: Math.round(Math.random()*10000), type: testName},
			{name: Math.round(Math.random()*10000), type: testName}
		];
		var properAutoIncrementVals = _.range(1,testData.length+1);

		it ('should not fail',function (done) {
			User.createEach(testData,done);
		});

		it ('should have saved the proper values (with auto-increment values)',function (done) {
			User.findAll({type: testName},function (err,users) {
				// console.log(users);
				if (err) done(new Error(err));
				else if (!pluckEqual(users,testData, 'name')) {
					done(new Error ('Proper user names were not saved!')); 
				}
				else if (!_.isEqual(_.pluck(users,'id'),properAutoIncrementVals)) {
					done(new Error ('Ids were not properly auto-incremented!')); 
				}
				else done();
			});

			// Check equality on two lists of objects 
			// using one particular attribute as a vector of comparison
			function pluckEqual(listA, listB, attrName) {
				return _.isEqual(_.pluck(listA, attrName),_.pluck(listB, attrName));
			}
		});
		
	});
});