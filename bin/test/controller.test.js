/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');
var GeneratorFactory = require('../generators/factory');



describe('file generator', function () {

	before(function () {
		this.fn = GeneratorFactory('controller');
	});



	describe('basic usage', function () {

		before(function () {
			this.options = {
				id: this.heap.alloc()
			};
		});


		it('should trigger `notSailsApp`',expect('notSailsApp'));

	});





	// describe('with empty data', function () {

	// 	before(function () {
	// 		this.options = {
	// 			pathToNew: this.heap.alloc(),
	// 			pathToTemplate: this.templates.file.path,
	// 			data: {}
	// 		};
	// 	});

	// 	it('should trigger `ok`', expect('ok'));
	// 	it('should create a file', assert.fileExists);
	// 	it('should create a file with the same checksum as the template', assert.fileChecksumMatchesTemplate);

	// });




	// describe('if file/folder already exists at `pathToNew`', function () {
	// 	before(function (){
	// 		this.options = {
	// 			pathToTemplate: this.templates.file.path
	// 		};
	// 	});

	// 	describe('(file)', function () {
	// 		// Create an extra file beforehand to simulate a collision
	// 		before(function (cb) {
	// 			this.options.pathToNew = this.heap.alloc();
	// 			this.heap.touch(this.options.pathToNew, cb);
	// 		});
	// 		it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing file without `options.force`!' }));
	// 	});

	// 	describe('(directory)', function () {
	// 		// Create an extra folder beforehand to simulate a collision
	// 		before(function (cb) {
	// 			this.options.pathToNew = this.heap.alloc();
	// 			this.heap.mkdirp(this.options.pathToNew, cb);
	// 		});
	// 		it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing directory without `options.force`!' }));
	// 	});

	// });


	// describe('if file/folder already exists and `force` option is true', function () {
	// 	before(function() {
	// 		this.options = {
	// 			force: true,
	// 			pathToTemplate: this.templates.file.path
	// 		};
	// 	});

	// 	describe('(file)', function () {
	// 		before(function(cb) {
	// 			this.options.pathToNew = this.heap.alloc();

	// 			// Create an extra file beforehand to simulate a collision
	// 			this.heap.touch(this.options.pathToNew, cb);
	// 		});

	// 		it('should trigger `ok`', expect('ok'));
	// 	});

	// 	describe('(directory)', function () {
	// 		before(function(cb) {
	// 			this.options.pathToNew = this.heap.alloc();
				
	// 			// Create an extra dir beforehand to simulate a collision
	// 			this.heap.mkdirp(this.options.pathToNew, cb);
	// 		});

	// 		it('should trigger `ok`', expect('ok'));
	// 	});

	// });


});

