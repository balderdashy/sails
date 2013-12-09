/**
 * Module dependencies
 */
var expect = require('./fixtures/expect');
var assert = require('./fixtures/assertions');
var GenerateModuleHelper = require('../generators/_helpers/module');


describe('module generator', function () {

	before(function () {
		this.fn = GenerateModuleHelper;
	});

	describe('when used WITHOUT a `generator` option', function () {

		before(function () {
			this.options = {
				pathToNew: this.sailsHeap.alloc()
			};
		});

		it('should trigger `invalid`', expect('invalid'));
	});


	// Make the heap destination look like a Sails app
	// to test both scenarios
	describe('when used OUTSIDE of a sails app', function () {

		before(function () {
			this.options = {
				generator: {}
			};
			this.options.pathToNew = this.sailsHeap.alloc();
		});

		it('should trigger `notSailsApp`', expect({
			notSailsApp: true,
			ok: 'Should trigger the `notSailsApp` handler, not `ok`!'
		}));


		describe('with `force` option enabled', function () {
			before(function () {
				this.options.force = true;
				this.options.pathToNew = this.sailsHeap.alloc();
			});

			it('should trigger `ok`', expect('ok'));
		});
	});



	describe('with an empty `generator`', function () {

		before(function () {
			this.options = {
				generator: {},
				appPath: this.sailsHeap.dirpath,
				pathToNew: this.sailsHeap.alloc()
			};
		});

		it('should trigger `ok`', expect('ok'));
		it('should create an empty file', assert.fileExists);

	});



	describe('using a `generator` with a simple render function', function () {
		before(function () {
			this.options = {
				appPath: this.sailsHeap.dirpath,
				generator: {
					render: function (options, cb){
						cb(null, 'some stuff');
					}
				},
				pathToNew: this.sailsHeap.alloc()
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
				appPath: this.sailsHeap.dirpath,
				generator: {
					render: function (options, cb){
						cb(null, 'some stuff');
					}
				},
				contents: 'foo',
				pathToNew: this.sailsHeap.alloc()
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
				appPath: this.sailsHeap.dirpath,
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
				this.options.pathToNew = this.sailsHeap.alloc();
				this.sailsHeap.touch(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing file without `options.force`!' }));
		});

		describe('(directory)', function () {
			// Create an extra folder beforehand to simulate a collision
			before(function (cb) {
				this.options.pathToNew = this.sailsHeap.alloc();
				this.sailsHeap.mkdirp(this.options.pathToNew, cb);
			});
			it(	'should trigger "alreadyExists" handler', expect({ alreadyExists: true, ok: 'Should not override existing directory without `options.force`!' }));
		});

	});


	describe('if file/folder already exists and `force` option is true', function () {
		before(function() {
			this.options = {
				appPath: this.sailsHeap.dirpath,
				force: true,
				generator: {
					render: function (options, cb){
						cb(null, 'You’re not your job. You’re not how much money you have in the bank. You’re not the car you drive. You’re not the contents of your wallet. You’re not your f***ing khakis. You’re the all-singing, all-dancing crap of the world. What do you want? Wanna go back to the s*** job, f***in’ condo world, watching sitcoms? F*** you, I won’t do it. Fifth rule: one fight at a time, fellas. Warning: If you are reading this then this warning is for you. Every word you read of this useless fine print is another second off your life. Don’t you have other things to do? Is your life so empty that you honestly can’t think of a better way to spend these moments? Or are you so impressed with authority that you give respect and credence to all that claim it?');
					}
				}
			};
		});

		describe('(file)', function () {
			before(function(cb) {
				this.options.pathToNew = this.sailsHeap.alloc();

				// Create an extra file beforehand to simulate a collision
				this.sailsHeap.touch(this.options.pathToNew, cb);
			});

			it('should trigger `ok`', expect('ok'));
		});

		describe('(directory)', function () {
			before(function(cb) {
				this.options.pathToNew = this.sailsHeap.alloc();
				
				// Create an extra dir beforehand to simulate a collision
				this.sailsHeap.mkdirp(this.options.pathToNew, cb);
			});

			it('should trigger `ok`', expect('ok'));
		});

	});


});

