var _ = require('underscore');

describe('case sensitivity', function() {

	var testName = 'case sensitivity and findAll()';
	before(function(cb) {
		User.createEach([

		// several of these exist
		{
			name: 'tHeTest',
			type: testName
		}, {
			name: 'thetest',
			type: testName
		}, {
			name: 'THETEST',
			type: testName
		}, 

		// only one of these exists
		{
			name: 'tHeOtherTest',
			type: testName
		}], cb);
	});


	describe('find()', function () {
		
		it('should work in a case insensitive fashion by default', function(cb) {
			User.find({
				name: 'theothertest',
				type: testName
			}, User.testExists(true, cb));
		});

		it('should work with findBy*()', function(cb) {
			User.findByName('theothertest', User.testExists(true, cb));
		});
	});

	describe('findAll()', function () {

		it('should work in a case insensitive fashion by default', function(cb) {
			User.findAll({
				name: 'thetest',
				type: testName
			},User.testCount(3, cb));
		});

		it('should work with findAllBy*()', function(cb) {
			User.findAllByName('thetest', User.testCount(3, cb));
		});
	});


	describe('special classified queries ', function () {

		var testName = 'contains case sensitivity';
		before(function(cb) {
			User.createEach([

				// several of these exist
				{
					name: 'tHeTest',
					type: testName
				}, {
					name: 'thetest',
					type: testName
				}, {
					name: 'THETEST',
					type: testName
				}, 

				// only one of these exists
				{
					name: 'tHeOtherTest',
					type: testName
				},

				{
					name: 'OTHER THINGS 0',
					type: testName
				},

				{
					name: 'OTHER THINGS 1',
					type: testName
				},

				{
					name: 'AR)H$daxx',
					type: testName
				},

				{
					name: 'AR)H$daxxy',
					type: testName
				},

				// ends with est
				{
					name: '0n3 m0r3 est',
					type: testName
				}
			], cb);
		});

		it('contains should work in a case insensitive fashion by default', function(cb) {
			User.findAll({
				name: {
					contains: 'hete'
				},
				type: testName
			},User.testCount(3, cb));
		});

		it('startsWith should work in a case insensitive fashion by default', function(cb) {
			User.findAll({
				name: {
					startsWith: 'the'
				},
				type: testName
			},User.testCount(4, cb));
		});

		it('endsWith should work in a case insensitive fashion by default', function(cb) {
			User.findAll({
				name: {
					endsWith: 'est'
				},
				type: testName
			},User.testCount(5, cb));
		});


		it('like should work in a case insensitive fashion by default', function(cb) {
			User.findAll({
				name: {
					like: '%hete%'
				},
				type: testName
			},User.testCount(3, cb));
		});

		it('endsWith should actually enforce endswith', function(cb) {
			User.findAll({
				name: {
					endsWith: 'AR)H$daxx'
				},
				type: testName
			},User.testCount(1, cb));
		});
	});
});