/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');
var Generator = require('../generators/factory')('controller');


describe('controller generator', function () {

	before(function () {

		// Access fn for module helper which always injects
		// the proper `generator` option
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



	// Make the heap destination look like a Sails app
	// to test both scenarios
	describe('when used OUTSIDE of a sails app', function () {

		before(function () {
			this.options = {};
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



	// describe('when used OUTSIDE of a sails app', function () {

	// 	before(function () {
	// 		this.options = {
	// 			id: this.heap.getFilename( this.heap.alloc() )
	// 		};
	// 	});


	// 	it('should trigger `notSailsApp`', expect('notSailsApp'));

	// });


	// describe('when used OUTSIDE of a sails app with `force`', function () {

	// 	before(function () {
	// 		this.options = {
	// 			id: this.heap.getFilename (this.heap.alloc()),
	// 			force: true
	// 		};
	// 	});


	// 	it('should trigger `ok`', expect('ok'));

	// });




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

