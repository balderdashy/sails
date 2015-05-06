/**
 * Module dependencies
 */
var assert	= require('assert'),
	fs		= require('fs'),
	wrench	= require('wrench'),
	exec	= require('child_process').exec,
	_		= require('lodash'),
	appHelper = require('./helpers/appHelper'),
	util	= require('util');


/**
 * Module errors
 */

describe('Services ::', function() {
	var appName = 'testApp',
		sailsprocess;


	// before we start tests, build the app
	before(function(done) {
		this.timeout(5000);
		appHelper.build(done);
	});

	// once we're done, remove the app
	after(function() {
		process.chdir('../');
		appHelper.teardown();
	});

	// before each test, start the app up fresh
	beforeEach(function(done) {
		// this.timeout(5000);
		appHelper.lift({
			verbose: false
		}, function(err, sails) {
			if (err) {
				throw new Error(err);
			}
			sailsprocess = sails;
			sailsprocess.once('hook:http:listening', done);
		});
	});

	// and after each test kill the process
	afterEach(function(done) {
		this.timeout(5000);
		sailsprocess.kill(done);
	});

	describe('basic services', function() {
		it('should exist', function(done) {
			assert.notEqual(typeof BasicService, "undefined", "Example service was not found!");
			done();
		});
		it('should have its methods bound to the services context', function(done) {
			assert.equal(BasicService, BasicService.getContext.apply({}), "Returning 'this' from a service method does not return that service");

			BasicService.setValue("foo");
			assert.equal(BasicService.getValue(), "foo", "Setting a value onto 'this' and then reading it back does not result in the same value");

			done();
		});
	});
	describe('services containing classes', function() {
		it('should not have their prototypes overwritten', function(done) {
			assert(BasicService.MyClass.hasOwnProperty('prototype'), "MyClass does not have its own prototype");
			assert(BasicService.MyClass.prototype.getFoo, "MyClass inside of basic service doesn't the same prototype");
			done();
		});
		it('should be able to instantiate an instance', function(done) {
			var instance = new BasicService.MyClass();
			assert.equal(instance.getFoo(), "Bar", "getFoo method returned bad data");

			done();
		});
		it('should be able to use instanceof', function(done) {
			assert((new Error("sadf")) instanceof BasicService.Error, "Cannot use instanceof to compare against Error in my service");
			assert((new BasicService.MyClass("sadf")) instanceof BasicService.MyClass, "Instance of MyClass is not instanceof MyClass");
			done();
		});
	});
});

