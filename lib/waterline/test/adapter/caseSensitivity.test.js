var _ = require('underscore');

var testName = 'case sensitivity';
describe(testName, function() {


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
});