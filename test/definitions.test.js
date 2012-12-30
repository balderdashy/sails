/**
 * definitions.test.js
 *
 * This module tests that basic waterline definitions create rules like they should.
 */

// Dependencies
var _ = require('underscore');
var parley = require('parley');
var async = require('async');
var assert = require("assert");


describe('definitions',function (){

	describe('createdAt', function() {

		it('should be on by default', function() {
			return User.adapter.config.createdAt;
		});

		it('should cause new schema to have a createdAt attribute', function(done) {
			User.adapter.describe('user',function (err,user) {
				if (err) return done(err);
				if (!(user && user.createdAt)) return done('User definition doesn\'t contain createdAt!');
				done(err);
			});
		});


		it('should cause new models to have a createdAt property', function(done) {
			User.create({},function (err,user) {
				if (err) return done(err);
				if (!(user && user.createdAt)) return done('Model doesn\'t contain createdAt!');
				done(err);
			});
		});
	});




	describe('updatedAt', function() {

		it('should be on by default', function() {
			return User.adapter.config.updatedAt;
		});

		it('should cause new schema to have an updatedAt attribute', function(done) {
			User.adapter.describe('user',function (err,user) {
				if (err) return done(err);
				if (!(user && user.updatedAt)) return done('User definition doesn\'t contain updatedAt!');
				done(err);
			});
		});

		it('should cause new models to have an updatedAt property', function(done) {
			User.create({},function (err,user) {
				if (err) return done(err);
				if (!(user && user.updatedAt)) return done('Model doesn\'t contain updatedAt!');
				done(err);
			});
		});
	});



	describe('primary key', function() {
		
		it('should be set to use id by default', function() {
			return User.adapter.config.defaultPK;
		});

		it('should cause new schema to have an id attribute', function(done) {
			User.adapter.describe('user',function (err,user) {
				if (err) return done(err);
				if (!(user && user.id)) return done('User definition doesn\'t contain id!');
				done(err);
			});
		});

		it('should cause new models to have an id property', function(done) {
			User.create({},function (err,user) {
				if (err) return done(err);
				if (!(user && user.id)) return done('Model doesn\'t contain id!');
				done(err);
			});
		});
	});
});