describe('benchmarks', function () {

	describe('sails.load()', function() {

		benchmark('require("sails")', function(cb) {
			var sails = require('sails');
			return cb();
		});
		
		benchmark('sails.load(), no hooks', function(cb) {
			var sails = require('sails');
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: []
			}, cb);
		});

		benchmark('sails.load() no hooks again', function(cb) {
			var sails = require('sails');
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: []
			}, cb);
		});

		benchmark('sails.load() no hooks again AGAIN', function(cb) {
			var sails = require('sails');
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: []
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
	it('should ' + description, function (cb) {
		console.time(description);
		fn(function _callback () {
			console.timeEnd(description);
			cb.apply(Array.prototype.slice.call(arguments));
		});
	});
}