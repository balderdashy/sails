var _ = require('underscore');

describe('sub-attribute criteria queries', function(cb) {
	describe('lessThan (<, <=)', function(cb) {

		var testName = 'lessThan test';

		before(function (cb) {
			User.createEach([{
				age: 40,
				name: testName
			},
			{
				age: 44,
				name: testName
			},
			{
				age: 45,
				name: testName
			},
			{
				age: 46,
				name: testName
			}], cb);
		});

		it('should work with basic usage', function(cb) {
			User.findAll({
				name: testName,
				age: {
					lessThan: 45
				}
			}, checkListResult(2, cb));
		});
		it('should work with symbolic usage', function(cb) {
			User.findAll({
				name: testName,
				age: {
					'<': 45
				}
			}, checkListResult(2, cb));
		});	

		it('lessThanOrEqual', function(cb) {
			User.findAll({
				name: testName,
				age: {
					lessThanOrEqual: 45
				}
			}, checkListResult(3, cb));
		});
		it('<=', function(cb) {
			User.findAll({
				name: testName,
				age: {
					'<=': 45
				}
			}, checkListResult(3, cb));
		});
	});

	describe('greaterThan (>, >=)', function(cb) {

		var testName = 'greaterThan test';

		before(function (cb) {
			User.createEach([{
				age: 0,
				name: testName
			},
			{
				age: 4,
				name: testName
			},
			{
				age: 5,
				name: testName
			},
			{
				age: 6,
				name: testName
			}], cb);
		});

		it('should work with basic usage', function(cb) {
			User.findAll({
				name: testName,
				age: {
					greaterThan: 5
				}
			}, checkListResult(1, cb));
		});
		it('should work with symbolic usage', function(cb) {
			User.findAll({
				name: testName,
				age: {
					'>': 5
				}
			}, checkListResult(1, cb));
		});	
		it('greaterThanOrEqual', function(cb) {
			User.findAll({
				name: testName,
				age: {
					greaterThanOrEqual: 5
				}
			}, checkListResult(2, cb));
		});
		it('>=', function(cb) {
			User.findAll({
				name: testName,
				age: {
					'>=': 5
				}
			}, checkListResult(2, cb));
		});	
	});



	describe('not (!)', function(cb) {

		var testName = 'not (!) test';

		before(function (cb) {
			User.createEach([{
				age: 40,
				name: testName
			},
			{
				age: 44,
				name: testName
			},
			{
				age: 45,
				name: testName
			},
			{
				age: 46,
				name: testName
			}], cb);
		});

		it('should work with basic usage', function(cb) {
			User.findAll({
				name: testName,
				age: {
					not: 40
				}
			}, checkListResult(3, cb));
		});
		it('should work with symbolic usage', function(cb) {
			User.findAll({
				name: testName,
				age: {
					'!': 40
				}
			}, checkListResult(3, cb));
		});	
	});
});

function checkListResult(expectedLength, cb) {
	return function (err, users) {
		if(err) throw new Error(err);
		else if(!users) throw new Error('Unexpected result: ' + users);
		else if(users.length !== expectedLength) throw new Error('Improper # of users returned (' + users.length + ')');
		else cb();
	};
}