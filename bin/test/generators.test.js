var async = require('async');
var checksum = require('checksum');
var GeneratorFactory = require('../generators/factory');
var FileHeap = require('./fixtures/FileHeap');
var _ = require('lodash');

describe('generator ::', function () {

	before(function (cb) {
		// Use an allocator to make it easier to manage files
		// generated during testing
		this.files = new FileHeap();

		// Track paths to fixtures here to make it easier
		// to change them later
		var templates = this.templates = {
			file: {
				path: 'test/fixtures/file.template'
			}
		};

		// Calculate checksums for each template
		async.each(Object.keys(this.templates), function each (templateID, cb) {
			var template = templates[templateID];
			checksum.file(template.path, function (err, sum) {
				if (err) return cb(err);
				template.checksum = sum;
				return cb();
			});
		}, cb);
	});

	after(function (cb) {
		this.files.cleanAll(cb);
	});



	describe('file', function () {


		// Fixtures
		var fixtures = {
			
			/**
			 * @param {Object||String} expectations
			 *		- if string specified, it is the name of the only valid handler
			 *		- if object specified, keys are handlers
			 *		- if value === true, this handler is allowed
			 *		- otherwise, use the value as an error
			 */
			expect: function ( expectations ) {
				var handlers = {};
				if ( typeof expectations === 'string' ) {
					handlers[expectations] = true;
				}
				else if ( typeof expectations === 'object' ) {
					handlers = expectations;
				}
				else throw new Error('Invalid usage of `expect()` fixture in tests.');

				return function (cb) {

					// Interpret handlers
					_.each( Object.keys(handlers), function (handlerName) {
						if ( handlers[handlerName] === true) {
							handlers[handlerName] = function ignoreHandlerArguments_itsAlwaysGood () { cb(); };
						}
						else {
							handlers[handlerName] = function incorrectHandlerFired (msg) {
								if ( msg instanceof Error ) return msg;
								else return new Error(msg);
							};
						}
					});

					// console.log('*******');
					// console.log('expectations :: ',expectations);
					// console.log('options :: ',this.options);
					// console.log('handlers :: ',handlers);
					// console.log('*******');
					
					// Trigger generator
					var generator = GeneratorFactory('file');
					generator(this.options, handlers);
				};
			}
		};



		// Local, reusable assertions

		var assertions = {

			fileExists: function (cb) {
				this.files.read(this.options.pathToNewFile, cb);
			},

			fileChecksumMatchesTemplate: function (cb) {
				var templateChecksum = this.templates.file.checksum;
				this.files.read(this.options.pathToNewFile, function (err, contents) {
					if (err) return cb(err);
					return cb(null, templateChecksum === checksum(contents));
				});
			}
		};


		describe('with no data', function () {
			before(function () {
				this.options = {
					pathToNewFile: this.files.alloc(),
					pathToTemplate: this.templates.file.path
				};
			});
			it('should trigger `ok`', fixtures.expect('ok'));
			it('should create a file', assertions.fileExists);
			it('should create a file with the same checksum as the template', assertions.fileChecksumMatchesTemplate);
		});


		describe('with empty data', function () {
			before(function () {
				this.options = {
					pathToNewFile: this.files.alloc(),
					pathToTemplate: this.templates.file.path,
					data: {}
				};
			});
			it('should trigger `ok`', fixtures.expect('ok'));
			it('should create a file', assertions.fileExists);
			it('should create a file with the same checksum as the template', assertions.fileChecksumMatchesTemplate);
		});


		describe('if file already exists', function () {

			before(function (cb) {
				this.options = {
					pathToNewFile: this.files.alloc(),
					pathToTemplate: this.templates.file.path
				};
				// Create an extra file beforehand to simulate a collision
				this.files.touch(this.options.pathToNewFile, cb);
			});

			it('should trigger "alreadyExists" handler',
				fixtures.expect({ 
					alreadyExists: true,
					ok: 'Should not override existing file without `options.force`!'
				})
			);
		});


	});

});






