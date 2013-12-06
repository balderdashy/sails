/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');
var FileHeap = require('./fixtures/FileHeap');
var TemplateManifest = require('./fixtures/TemplateManifest');


/**
 * Use an allocator to make it easier to manage files
 * generated during testing
 */
var heap = new FileHeap();



describe('file', function () {
	
	// Load template fixtures here so they're accessible below
	before(function (cb) {
		var self = this;
		TemplateManifest.load(function (err) {
			if (err) return err;
			self.templates = TemplateManifest;
			cb();
		});
	});

	// Clean up loose files afterwards
	after(function (cb) {
		heap.cleanAll(cb);
	});





	describe('with no data', function () {

		before(function () {
			this.options = {
				pathToNewFile: heap.alloc(),
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
				pathToNewFile: heap.alloc(),
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
				pathToNewFile: heap.alloc(),
				pathToTemplate: this.templates.file.path
			};
			// Create an extra file beforehand to simulate a collision
			heap.touch(this.options.pathToNewFile, cb);
		});

		it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing file without `options.force`!' }));

	});





	describe('if file already exists and `force` option is true', function () {

		before(function(cb) {
			this.options = {
				pathToNewFile: heap.alloc(),
				pathToTemplate: this.templates.file.path,
				force: true
			};
			// Create an extra file beforehand to simulate a collision
			heap.touch(this.options.pathToNewFile, cb);
		});

		it('should trigger `ok`', expect('ok'));

	});
});

