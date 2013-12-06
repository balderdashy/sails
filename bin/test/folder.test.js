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
		it('should create a directory', assert.fileExists);

	});





	describe('if file/folder already exists at `pathToNew`', function () {

		describe('(file)', function () {
			// Create an extra file beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.touch(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing file/directory without `options.force`!' }));
		});

		describe('(directory)', function () {
			// Create an extra folder beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.mkdirp(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing file/directory without `options.force`!' }));
		});

	});


	describe('if file/folder already exists and `force` option is true', function () {
		before(function() {
			this.options = {
				force: true
			};
		});

		describe('(file)', function () {
			// Create an extra file beforehand to simulate a collision
			before(function(cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.touch(this.options.pathToNew, cb);
			});

			it('should trigger `ok`', expect('ok'));
		});

		describe('(directory)', function () {
			// Create an extra file beforehand to simulate a collision
			before(function(cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.mkdirp(this.options.pathToNew, cb);
			});

			it('should trigger `ok`', expect('ok'));
		});

	});


});

