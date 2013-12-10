/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');
var Generator = require('../generators/factory')('model');


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

		it('should work', expect('ok'));		
	});

	describe('invalid usage', function () {
		before(function () {
			this.options = {
				appPath: this.sailsHeap.dirpath
			};
		});

		it('requires `id` option', expect({
			invalid: true,
			ok: 'Should not hit `ok` handler since required `id` parameter was not specified!'
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
			ok: 'Should trigger the `notSailsApp` handler, not `ok`!'
		}));


		describe('with `force` option enabled', function () {
			before(function () {
				this.options.force = true;
				this.options.appPath = this.heap.dirpath;
			});

			it('should trigger `ok`', expect('ok'));
		});
	});
});

