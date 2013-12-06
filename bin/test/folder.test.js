/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');
var GeneratorFactory = require('../generators/factory');





describe('folder generator', function () {

	before(function () {
		this.fn = GeneratorFactory('folder');
	});



	describe('with missing `pathToNew', function () {

		before(function () {
			this.options = {};
		});

		it('should trigger `invalid`',expect('invalid'));
	});





	describe('basic usage', function () {

		before(function () {
			this.options = {
				pathToNew: this.heap.alloc()
			};
		});

		it('should trigger `ok`', expect('ok'));
		it('should create a file', assert.fileExists);

	});





	describe('if file or folder already exists at `pathToNew`', function () {

		before(function (cb) {
			this.options = {
				pathToNew: this.heap.alloc()
			};
			// Create an extra file beforehand to simulate a collision
			this.heap.touch(this.options.pathToNew, cb);
		});

		it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing file without `options.force`!' }));

	});





	describe('if file already exists and `force` option is true', function () {

		before(function(cb) {
			this.options = {
				pathToNew: this.heap.alloc(),
				force: true
			};
			// Create an extra file beforehand to simulate a collision
			this.heap.touch(this.options.pathToNew, cb);
		});

		it('should trigger `ok`', expect('ok'));

	});


});

