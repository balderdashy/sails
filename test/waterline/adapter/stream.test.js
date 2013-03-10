var _ = require('underscore');
var async = require('async');


describe('streaming', function() {

	var testName = 'streaming test';
	before(function(cb) {
		User.createEach([

		// several of these exist
		{
			name: 'a',
			type: testName
		}, {
			name: 'b',
			type: testName
		}, {
			name: 'c',
			type: testName
		}], cb);
	});


	describe('stream()', function () {

		it('should return and terminate a valid Node.js stream', function (cb) {
			var stream = User.stream();
			stream.on('end', cb);
		});

		it('should grab the same set of data as findAll', function (cb) {
			var userstream = User.stream();
			var streamedData = '';

			userstream.on('data', function (data) {
				streamedData += data;
			});
			userstream.on('error', function (err) {
				throw new Error(err);
			});

			async.auto({
				streamReady: function (cb) {
					userstream.on('end', function (){
						cb(null, streamedData);
					});
				},

				findAllReady: function (cb) {
					User.findAll().done(function (err,users) {
						users = _.pluck(users, 'values');

						// Serialize to JSON so it will match the streamed output
						users = JSON.stringify(users);
						cb(err,users);
					});
				}
			}, function (err, results) {
				if (err) throw new Error(err);
				else if (!(results.streamReady && results.findAllReady)) throw new Error ('Invalid results sent.');
				
				// Check equality of findAll() and stream() result sets
				var equals = _.isEqual(results.findAllReady, results.streamReady);
				if (!equals) cb(new Error('JSON over stream does not equal JSON-stringified findAll() model values!'));
				else cb();
			});
		});
		
	});


	// TODO: test iterative transformations (like XML conversion)
	
});