/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');



describe('module generator', function () {

	before(function () {
		this.fn = require('../generators/_helpers/module');
	});

	describe('when used WITHOUT a `generator` option', function () {

		before(function () {
			this.options = {
				id: this.heap.getFilename( this.heap.alloc() )
			};
		});

		it('should trigger `invalid`', expect('invalid'));
	});



	describe('with an empty `generator`', function () {

		before(function () {
			this.options = {
				generator: {},
				pathToNew: this.heap.alloc()
			};
		});

		it('should trigger `ok`', expect('ok'));
		it('should create an empty file', assert.fileExists);

	});



	describe('using a `generator` with a simple render function', function () {
		before(function () {
			this.options = {
				generator: {
					render: function (options, cb){
						cb(null, 'some stuff');
					}
				},
				pathToNew: this.heap.alloc()
			};
		});

		it('should trigger `ok`', expect('ok'));
		it('should create a file', assert.fileExists);
		it('file contents match the generator\'s `render` method', assert.fileIsExactly('some stuff'));
		it('file contents match the generator\'s `render` method', assert.fileIsNot('A$(GJDALDG'));
	});



	describe('using a `generator` with a `contents` override', function () {
		before(function () {
			this.options = {
				generator: {
					render: function (options, cb){
						cb(null, 'some stuff');
					}
				},
				contents: 'foo',
				pathToNew: this.heap.alloc()
			};
		});

		it('should trigger `ok`', expect('ok'));
		it('should create a file', assert.fileExists);
		it('file contents match the `contents` override', assert.fileIsExactly('foo'));
		it('file contents match the `contents` override', assert.fileIsNot('fo3j2jggjo'));
	});



	describe('if file/folder already exists at `pathToNew`', function () {

		before(function() {
			this.options = {
				generator: {
					render: function (options, cb){
						cb(null, 'Ατ σανστυς λαβορες ιντελλεγεβαθ σεα. Κυι νο φυγιθ κυανδο, περ φασερ φιδερερ διγνισιμ θε, ιυς εξ νοβις νομινατι. Εως γραεσε φοσιβυς συ, συ μαγνα λαβωρε ευμ. Φιμ λυδυς υρβανιθας εα, ει ηας γραεσε φιδερερ αβχορρεανθ. Αυτεμ φυγιθ ευ μει. Ιυς κυας δεσωρε απεριρι υθ, νε λεγιμυς ερροριβυς σπλενδιδε συμ, φιμ ατ σολεατ σαπερεθ.');
					}
				}
			};
		});

		describe('(file)', function () {
			// Create an extra file beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.touch(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing file without `options.force`!' }));
		});

		describe('(directory)', function () {
			// Create an extra folder beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.heap.alloc();
				this.heap.mkdirp(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing directory without `options.force`!' }));
		});

	});


	describe('if file/folder already exists and `force` option is true', function () {
		before(function() {
			this.options = {
				force: true,
				generator: {
					render: function (options, cb){
						cb(null, 'some stuff');
					}
				}
			};
		});

		describe('(file)', function () {
			before(function(cb) {
				this.options.pathToNew = this.heap.alloc();

				// Create an extra file beforehand to simulate a collision
				this.heap.touch(this.options.pathToNew, cb);
			});

			it('should trigger `ok`', expect('ok'));
		});

		describe('(directory)', function () {
			before(function(cb) {
				this.options.pathToNew = this.heap.alloc();
				
				// Create an extra dir beforehand to simulate a collision
				this.heap.mkdirp(this.options.pathToNew, cb);
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


});

