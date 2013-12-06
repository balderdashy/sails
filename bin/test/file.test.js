/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');
var GeneratorFactory = require('../generators/factory');



describe('file generator', function () {

	before(function () {
		this.fn = GeneratorFactory('file');
	});



	describe('with no data', function () {

		before(function () {
			this.options = {
				pathToNew: this.heap.alloc(),
				pathToTemplate: this.templates.file.path
			};
		});



		it('should trigger `ok`',expect('ok'));
		it('should create a file', assert.fileExists);
		it('should create a file with the same checksum as the template', assert.fileChecksumMatchesTemplate);

	});





	describe('with empty data', function () {

		before(function () {
			this.options = {
				pathToNew: this.heap.alloc(),
				pathToTemplate: this.templates.file.path,
				data: {}
			};
		});

		it('should trigger `ok`', expect('ok'));
		it('should create a file', assert.fileExists);
		it('should create a file with the same checksum as the template', assert.fileChecksumMatchesTemplate);

	});





	describe('if file already exists', function () {

		before(function (cb) {
			this.options = {
				pathToNew: this.heap.alloc(),
				pathToTemplate: this.templates.file.path
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
				pathToTemplate: this.templates.file.path,
				force: true
			};
			// Create an extra file beforehand to simulate a collision
			this.heap.touch(this.options.pathToNew, cb);
		});

		it('should trigger `ok`', expect('ok'));

	});
});

