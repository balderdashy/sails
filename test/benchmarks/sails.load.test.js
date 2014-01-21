
describe('benchmarks', function () {

	describe('sails.load()', function() {
		before(setupBenchmarks);
		after(reportBenchmarks);

		benchmark('require("sails")', function(cb) {
			var Sails = require('../../lib/app');
			var sails = new Sails();
			return cb();
		});
		
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
	it(description, function (cb) {
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
	console.log('\n\n');
	console.log('Benchmarks::');
	var benchmarks = _.reduce(this.benchmarks, function (memo, result) {

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
			(ms < 1*expected/10) ? 'blue' :
			(ms < 3*expected/10) ? 'cyan' :
			(ms < 6*expected/10) ? 'yellow' :
			(ms < threshold) ? 'orange' : 
			'red';

		ms += 'ms';
		ms = ms[color];

		return memo + '\n ' + 
			(result.benchmark+'') + ' :: '.grey + ms +

			// Expected ms provided, and the test took quite a while
			(result.expected && ms >= threshold ? '\n   (expected '+expected+'ms' +
				(result.comment ? ' --' + result.comment : '') +
			')' :

			// Comment provided - but no expected ms
			(result.comment ? '\n   (' + result.comment +')\n' : '')
			).grey;
	},'');
	console.log(benchmarks);
}