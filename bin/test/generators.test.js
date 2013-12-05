var async = require('async');
var checksum = require('checksum');
var assert = require('assert');
var GeneratorFactory = require('../generators/factory');
var FileHeap = require('./fixtures/FileHeap');

describe('generators', function () {

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
		before(function () {
			this.generate = GeneratorFactory('file');
		});




		describe('with no data', function () {
			before(function (cb) {
				this.filename = this.files.alloc();
				this.pathToTemplate = this.templates.file.path;
				
				this.generate({
					filename: this.filename,
					pathToTemplate: this.pathToTemplate
				},

				// Tested automatically:
				// 'should fire `ok()` handler w/ no output'
				{ ok: cb });
			});

			it('should output the expected file', function (cb) {
				this.files.read(this.filename, cb);
			});

			it('file should have the same checksum as the template', function (cb) {
				var templateChecksum = this.templates.file.checksum;

				this.files.read(this.filename, function (err, contents) {
					if (err) return cb(err);
					return cb(null, templateChecksum === checksum(contents));
				});
			});
		});




		describe('with empty data', function () {
			before(function (cb) {
				this.filename = this.files.alloc();
				this.pathToTemplate = this.templates.file.path;
				
				this.generate({
					filename: this.filename,
					pathToTemplate: this.pathToTemplate,
					data: {}
				},

				// Tested automatically:
				// 'should fire `ok()` handler w/ no output'
				{ ok: cb });
			});

			it('should output the expected file', function (cb) {
				this.files.read(this.filename, cb);
			});

			it('file should have the same checksum as the template', function (cb) {
				var templateChecksum = this.templates.file.checksum;

				this.files.read(this.filename, function (err, contents) {
					if (err) return cb(err);
					return cb(null, templateChecksum === checksum(contents));
				});
			});
		});


	});

});
