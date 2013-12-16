describe('benchmarks', function () {

	describe('sails.load()', function() {

		benchmark('require("sails")', function() {
			var sails = require('sails');
		});
		
		benchmark('sails.load(), no hooks', function(cb) {
			var sails = require('sails');
			sails.load({
				log: { level: 'error' },
				globals: false,
				loadHooks: [],
				connections: { foo: { module: 'sails-disk' } }
			}, cb);
		});

		benchmark('sails.load() no hooks', function(cb) {
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

	it('should ' + description, fn);
}