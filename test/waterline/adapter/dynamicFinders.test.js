/**
 * dynamicFinders.test.js
 *
 * This module tests that dynamic finders ( i.e. findByFoo() ) are working properly
 */

// Dependencies
var _ = require('underscore');
var parley = require('parley');
var async = require('async');
var assert = require("assert");


describe('dynamic finders',function (){

	describe('findBy', function() {

		it('should return the user with the given name', function(done) {
			var testName = 'dynamic_finder_test_findByName';

			User.create({
				name: testName
			},function (err) {
				if (err) return done(err);
				User.findByName(testName,function(err,user) {
					if (err) return done(err);
					if (!user) return done('Dynamic finder did not return anything!');
					if (user.name !== testName) return done('Dynamic finder returned incorrect user!');
					done(err);
				});
			});
		});
	});

	describe('findAllBy', function() {

		it('should return the users with the given name', function(done) {
			var testName = 'dynamic_finder_test_findAllByName';

			User.create({
				name: testName
			},function (err) {
				if (err) return done(err);
				User.findAllByName(testName,function(err,users) {
					if (err) return done(err);
					if (users.length < 1) return done('Dynamic finder did not return anything!');
					if (users[0].name !== testName) return done('Dynamic finder returned incorrect user!');
					done(err);
				});
			});
		});
	});

	describe('findBy*In', function() {

		it('should return the user with the given name', function(done) {
			var testName = 'dynamic_finder_test_findBy*In';

			User.create({ name: testName },function (err) {
				if (err) return done(err);
				User.findAllByNameIn([testName, 'foo', 'bar', 'baz'],function(err,users) {
					if (err) return done(err); 
					if (users.length < 1) return done('Dynamic finder did not return anything!');
					if (users[0].name !== testName) return done('Dynamic finder returned incorrect user!');
					done(err);
				});
			});
		});
	});

	describe('findAllBy*In', function() {

		it('should return the users with the given name', function(done) {
			var testName = 'dynamic_finder_test_findAllBy*In';
			var testName2 = 'dynamic_finder_test_findAllBy*In2  da';

			User.createEach([{ name: testName }, { name: testName2 }],function (err) {
				if (err) return done(err);
				User.findAllByNameIn([testName, 'foo', 'bar', testName2, 'baz'],function(err,users) {
					if (err) return done(err); 
					if (users.length < 1) return done('Dynamic finder did not return anything!');
					if ( !(
						(users[0].name === testName && users[1].name === testName2) ||
						(users[0].name === testName2 && users[1].name === testName)
					)) {
						console.error("IS: ",'('+users[0].name+','+users[1].name+')');
						console.error("Should be:",testName,testName2);
						return done(new Error('Dynamic finder returned incorrect user!'));
					}
					done(err);
				});
			});
		});
	});

	describe('findBy*Like', function() {

		it('should return the user with the given name', function(done) {
			var part = 'findByNameLike';
			var testName = 'dynamic_finder_test_'+part+' and other stuff you know';

			User.create({
				name: testName
			},function (err) {
				if (err) return done(err);
				User.findByNameLike(part,function(err,user) {
					if (err) return done(err);
					if (user.name !== testName) return done('Dynamic finder returned incorrect user!');
					done(err);
				});
			});
		});
	});

	describe('findAllBy*Like', function() {

		it('should return the users with the given name', function(done) {
			var part = 'findAllByNameLike';
			var testName = 'dynamic_finder_test_'+part+' and other stuff you know';
			var testName2 = 'dynamic_finder_test_'+part+' and more other stuff you know';

			User.createEach([{
				name: testName
			}, {
				name: testName2
			}],function (err) {
				if (err) return done(err);
				User.findAllByNameLike(part,function(err,users) {
					if (err) return done(err);
					if (users.length < 1) return done('Dynamic finder did not return anything!');
					if ( !(
						(users[0].name === testName && users[1].name === testName2) ||
						(users[0].name === testName2 && users[1].name === testName)
					)) {
						console.error("Should be:",testName,testName2);
						console.error("IS: ",'('+users[0].name+','+users[1].name+')');
						return done(new Error('Dynamic finder returned incorrect user!'));
					}
					done(err);
				});
			});
		});
	});

	describe('edge cases', function() {

		it('should throw an error if finding by unknown attributes', function(done) {
			var testName = 'dynamic_finder_test_edge_cases';

			User.create({
				name: testName
			},function (err) {
				if (err) return done(err);

				// Some ridiculous dynamic finder
				try {
					User.findByAardvark(testName,done);
					throw new Error('Unexpected behavior-- trying to use a dynamic finder with unknown attribute(s) should cause an error.');
				}
				catch (e) {
					done();
				}
			});
		});
	});
});