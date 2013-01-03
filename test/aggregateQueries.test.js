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
			{name: "b"+Math.round(Math.random()*10000), type: testName},
			{name: "c"+Math.round(Math.random()*10000), type: testName},
			{name: "d"+Math.round(Math.random()*10000), type: testName}
		];

		it ('should not fail',function (done) {
			User.createEach(testData,done);
		});

		it ('should have saved the proper values',function (done) {
			User.findAll({type: testName},function (err,users) {
				if (err) done(new Error(err));
				else if (!_.isEqual(users,testData)) done(new Error ('Proper users were not saved!')); 
				else done();
			});
		});
		
	});
});