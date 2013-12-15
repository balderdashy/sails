/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');





describe('folder generator', function () {

	before(function () {
		this.fn = require('../generators/_helpers/folder');
		this.options = {};
	});



	describe('with missing `pathToNew`', function () {
		it('should trigger `invalid`',expect('invalid'));
	});



	describe('basic usage', function () {

		before(function () {
			this.options = {
				pathToNew: this.heap.alloc()
			};
		});

		it('should trigger `success`', expect({
			success: true,
			alreadyExists: 'Folder already exists..?'
		}));
		it('should create a directory', assert.dirExists);

	});


	describe('with dry run enabled', function () {
		before(function () {
			this.options = {
				pathToNew: this.heap.alloc(),
				contents: 'foo',
				dry: true
			};
		});
		
		it('should trigger `success`',expect('success'));
		it('should not actually create a directory', assert.dirDoesntExist);
	});


	describe('if file/folder already exists at `pathToNew`', function () {
		before(function (){
			this.options = {};
		});

		describe('(file)', function () {
			// Create an extra file beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.touch(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, success: 'Should not override existing file/directory without `options.force`!' }));
		});

		describe('(directory)', function () {
			// Create an extra folder beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.mkdirp(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, success: 'Should not override existing file/directory without `options.force`!' }));
		});

	});


	describe('if file/folder already exists and `force` option is true', function () {
		before(function() {
			this.options = { force: true };
		});

		describe('(file)', function () {
			before(function(cb) {
				this.options.pathToNew = this.heap.alloc();

				// Create an extra file beforehand to simulate a collision
				this.heap.touch(this.options.pathToNew, cb);
			});

			it('should trigger `success`', expect('success'));
		});

		describe('(directory)', function () {
			before(function(cb) {
				this.options.pathToNew = this.heap.alloc();
				
				// Create an extra dir beforehand to simulate a collision
				this.heap.mkdirp(this.options.pathToNew, cb);
			});

			it('should trigger `success`', expect('success'));
		});

	});


});

