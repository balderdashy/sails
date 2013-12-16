var _ = require('lodash');
require('colors');

describe('benchmarks', function () {

	describe('sails.load()', function() {
		before(function () {
			this.microtime = require('microtime');
			this.results = [];
		});
		after(function () {
			console.log('\n\n');
			console.log('Benchmarks::');
			var benchmarks = _.reduce(this.results, function (memo, result) {

				// Convert to ms- round to 0 decimal places
				var ms = (result.duration / 1000.0);
				ms = Math.round(ms * 1) / 1;


				var expected = this.expected || 1000;
				var color =
					(ms < expected/10) ? 'blue' :
					(ms < expected/5) ? 'cyan' :
					(ms < expected/3) ? 'yellow' :
					(ms < expected/2) ? 'orange' : 
					'red';

				ms += 'ms';
				ms = ms[color];

				return memo + '\n ' + 
					(result.benchmark+'').grey + ' :: ' + ms;
			},'');
			console.log(benchmarks);
		});

		benchmark('require("sails")', function(cb) {
			var sails = require('sails');
			return cb();
		});
		
		benchmark('first time, no hooks', function(cb) {
			var sails = require('sails');
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: []
			}, cb);
		});

		benchmark('again, no hooks', function(cb) {
			var sails = require('sails');
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: []
			}, cb);
		});

		benchmark('with moduleloader hook', function(cb) {
			var sails = require('sails');
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: ['moduleloader']
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
		fn(function _callback () {
			// console.timeEnd(description);
			var finishedAt = self.microtime.now();
			var duration = finishedAt - startedAt;
			self.results.push({duration: duration, benchmark: description});
			cb.apply(Array.prototype.slice.call(arguments));
		});
	});
}