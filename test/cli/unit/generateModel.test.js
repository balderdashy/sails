/**
 * Module dependencies
 */
var expect = require('./helpers/expect');
var assert = require('./helpers/assertions');
var __bin = '../../../bin';
var Generator = require(__bin+'/generators/factory')('model');


describe('model generator', function () {

	before(function () {
		this.fn = Generator;
	});

	describe('basic usage', function () {

		before(function () {
			this.options = {
				appPath: this.sailsHeap.dirpath,
				id: this.sailsHeap.getFilename( this.sailsHeap.alloc() )
			};
		});

		it('should work', expect('success'));		
	});

	describe('invalid usage', function () {
		before(function () {
			this.options = {
				appPath: this.sailsHeap.dirpath
			};
		});

		it('requires `id` option', expect({
			invalid: true,
			success: 'Should not hit `success` handler since required `id` parameter was not specified!'
		}));
	});

	// Make the heap destination look like a Sails app
	// to test both scenarios
	describe('when used OUTSIDE of a sails app', function () {

		before(function () {
			this.options = {
				appPath: this.heap.appPath,
				id: this.sailsHeap.getFilename( this.sailsHeap.alloc() )
			};
		});

		it('should trigger `notSailsApp`', expect({
			notSailsApp: true,
			success: 'Should trigger the `notSailsApp` handler, not `success`!'
		}));


		describe('with `force` option enabled', function () {
			before(function () {
				this.options.force = true;
				this.options.appPath = this.heap.dirpath;
			});

			it('should trigger `success`', expect('success'));
		});
	});
});

