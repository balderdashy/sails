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
		
		// it('should work in a case insensitive fashion by default', function(cb) {
		// 	User.find({
		// 		name: 'theothertest',
		// 		type: testName
		// 	}, User.testExists(true, cb));
		// });

		// it('should work with findBy*()', function(cb) {
		// 	User.findByName('theothertest', User.testExists(true, cb));
		// });
	});

	// describe('findAll()', function () {

	// 	it('should work in a case insensitive fashion by default', function(cb) {
	// 		User.findAll({
	// 			name: 'thetest',
	// 			type: testName
	// 		},User.testCount(3, cb));
	// 	});

	// 	it('should work with findAllBy*()', function(cb) {
	// 		User.findAllByName('thetest', User.testCount(3, cb));
	// 	});
	// });


	// describe('special classified queries ', function () {

	// 	var testName = 'contains case sensitivity';
	// 	before(function(cb) {
	// 		User.createEach([

	// 			// several of these exist
	// 			{
	// 				name: 'tHeTest',
	// 				type: testName
	// 			}, {
	// 				name: 'thetest',
	// 				type: testName
	// 			}, {
	// 				name: 'THETEST',
	// 				type: testName
	// 			}, 

	// 			// only one of these exists
	// 			{
	// 				name: 'tHeOtherTest',
	// 				type: testName
	// 			},

	// 			{
	// 				name: 'OTHER THINGS 0',
	// 				type: testName
	// 			},

	// 			{
	// 				name: 'OTHER THINGS 1',
	// 				type: testName
	// 			},

	// 			{
	// 				name: 'AR)H$daxx',
	// 				type: testName
	// 			},

	// 			{
	// 				name: 'AR)H$daxxy',
	// 				type: testName
	// 			},

	// 			// ends with est
	// 			{
	// 				name: '0n3 m0r3 est',
	// 				type: testName
	// 			}
	// 		], cb);
	// 	});

	// 	it('contains should work in a case insensitive fashion by default', function(cb) {
	// 		User.findAll({
	// 			name: {
	// 				contains: 'hete'
	// 			},
	// 			type: testName
	// 		},User.testCount(3, cb));
	// 	});

	// 	it('startsWith should work in a case insensitive fashion by default', function(cb) {
	// 		User.findAll({
	// 			name: {
	// 				startsWith: 'the'
	// 			},
	// 			type: testName
	// 		},User.testCount(4, cb));
	// 	});

	// 	it('endsWith should work in a case insensitive fashion by default', function(cb) {
	// 		User.findAll({
	// 			name: {
	// 				endsWith: 'est'
	// 			},
	// 			type: testName
	// 		},User.testCount(5, cb));
	// 	});


	// 	it('like should work in a case insensitive fashion by default', function(cb) {
	// 		User.findAll({
	// 			name: {
	// 				like: '%hete%'
	// 			},
	// 			type: testName
	// 		},User.testCount(3, cb));
	// 	});

	// 	it('endsWith should actually enforce endswith', function(cb) {
	// 		User.findAll({
	// 			name: {
	// 				endsWith: 'AR)H$daxx'
	// 			},
	// 			type: testName
	// 		},User.testCount(1, cb));
	// 	});
	// });
});