

var _ = require('lodash');
var portfinder = require('portfinder');
portfinder.basePort = 2001;

var SHOW_VERBOSE_BENCHMARK_REPORT = _.any(process.argv, function(arg) {
	return arg.match(/-v/);
});

describe('benchmarks', function () {

	describe('sails.load()', function() {
		before(setupBenchmarks);
		after(reportBenchmarks);


		//
		// Instantiate
		//

		benchmark('require("sails")', function(cb) {
			var Sails = require('../../lib/app');
			var sails = new Sails();
			return cb();
		});
		

		//
		// Load
		//

		benchmark('sails.load  [first time, no hooks]', function(cb) {
			var Sails = require('../../lib/app');
			var sails = new Sails();
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: []
			}, cb);
		});

		benchmark('sails.load  [again, no hooks]', function(cb) {
			this.expected = 25;
			this.comment = 'faster b/c of require cache';

			var Sails = require('../../lib/app');
			var sails = new Sails();
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: []
			}, cb);
		});

		benchmark('sails.load  [with moduleloader hook]', function(cb) {
			this.expected = 25;
			this.comment = 'faster b/c of require cache';

			var Sails = require('../../lib/app');
			var sails = new Sails();

			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: ['moduleloader']
			}, cb);

		});

		benchmark('sails.load  [all core hooks]', function(cb) {
			this.expected = 3000;

			var Sails = require('../../lib/app');
			var sails = new Sails();
			sails.load({
				log: { level: 'error' },
				globals: false
			}, cb);
		});

		benchmark('sails.load  [again, all core hooks]', function(cb) {
			this.expected = 3000;

			var Sails = require('../../lib/app');
			var sails = new Sails();
			sails.load({
				log: { level: 'error' },
				globals: false
			}, cb);
		});


		//
		// Lift
		//

		benchmark('sails.lift  [w/ a hot require cache]', function(cb) {
			this.expected = 3000;

			var Sails = require('../../lib/app');
			var sails = new Sails();
			portfinder.getPort(function (err, port) {
				if (err) throw err;

				sails.lift({
					log: { level: 'error' },
					port: port,
					globals: false
				}, cb);
			});
		});

		benchmark('sails.lift  [again, w/ a hot require cache]', function(cb) {
			this.expected = 3000;

			var Sails = require('../../lib/app');
			var sails = new Sails();
			portfinder.getPort(function (err, port) {
				if (err) throw err;

				sails.lift({
					log: { level: 'error' },
					port: port,
					globals: false
				}, cb);
			});
		});

	});


});


/**
 * Run the specified function, capturing time elapsed.
 * 
 * @param  {[type]}   description [description]
 * @param  {Function} fn          [description]
 * @return {[type]}               [description]
 */
function benchmark (description, fn) {
	
	it (description, function (cb) {
		var self = this;

		var startedAt = self.microtime.now();
		// console.time(description);

		fn.apply(this, [function _callback () {
			
			var _result = {};

			// If a `comment` or `expected` was provided, harvest it
			_result.expected = self.expected;
			self.expected = null;
			_result.comment = self.comment;
			self.comment = null;
			var finishedAt = self.microtime.now();
			_result.duration = finishedAt - startedAt;
			_result.benchmark = description;

			// console.log('finished ',_result);
			self.benchmarks.push(_result);
			cb.apply(Array.prototype.slice.call(arguments));
		}]);
	});
}


/**
 * Use in mocha's `before`
 * 
 * @this {Array} benchmarks
 * @this {Object} microtime
 */
function setupBenchmarks() {
	this.microtime = require('microtime');
	this.benchmarks = [];
}


/**
 * Use in mocha's `after`
 * 
 * @this {Array} benchmarks
 * @this {Object} microtime
 */
function reportBenchmarks () {
	var _ = require('lodash');

	require('colors');

	var output = '\n\nBenchmark Report ::\n';
	output += _.reduce(this.benchmarks, function (memo, result) {

		// Convert to ms-
		var ms = (result.duration / 1000.0);

		// round to 0 decimal places
		function _roundDecimalTo (num, numPlaces) {
			return +(Math.round(num + ('e+'+numPlaces))  + ('e-'+numPlaces));
		}
		ms = _roundDecimalTo(ms, 2);


		var expected = result.expected || 1000;

		// threshold: the "failure" threshold
		var threshold = result.expected;

		var color =
			(ms < 1*expected/10) ? 'green' :
			(ms < 3*expected/10) ? 'green' :
			(ms < 6*expected/10) ? 'cyan' :
			(ms < threshold) ? 'yellow' : 
			'red';

		ms += 'ms';
		ms = ms[color];

		// Whether to show expected ms
		var showExpected = true; // ms >= threshold;

		return memo + '\n ' + 
			(result.benchmark+'') + ' :: '.grey + ms +

			// Expected ms provided, and the test took quite a while
			(result.expected && showExpected ? '\n   (expected '+expected+'ms' +
				(result.comment ? ' --' + result.comment : '') +
			')' :

			// Comment provided - but no expected ms
			(result.comment ? '\n   (' + result.comment +')\n' : '')
			).grey;
	},'');

	// Log output (optional)
	if (SHOW_VERBOSE_BENCHMARK_REPORT) {
		console.log( output );
	}
}
