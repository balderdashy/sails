/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');



describe('file generator', function () {

	before(function () {
		this.fn = require('../generators/_helpers/file');
	});



	describe('with no data', function () {

		before(function () {
			this.options = {
				pathToNew: this.heap.alloc(),
				contents: 'foo'
			};
		});



		it('should trigger `success`',expect('success'));
		it('should create a file', assert.fileExists);

	});



	describe('if file/folder already exists at `pathToNew`', function () {
		before(function (){
			this.options = {
				contents: 'blah blah blah'
			};
		});

		describe('(file)', function () {
			// Create an extra file beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.touch(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, success: 'Should not override existing file without `options.force`!' }));
		});

		describe('(directory)', function () {
			// Create an extra folder beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.mkdirp(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, success: 'Should not override existing directory without `options.force`!' }));
		});

	});


	describe('if file/folder already exists and `force` option is true', function () {
		before(function() {
			this.options = {
				force: true,
				contents: 'blahhhh blahhhh blahhhh'
			};
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

