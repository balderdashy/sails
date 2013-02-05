var _ = require('underscore');
describe('lessThan', function(cb) {

	var testName = 'lessThan test';

	before(function (cb) {
		User.createEach([{
			age: 40,
			type: 'rangeQuery test'
		},
		{
			age: 44,
			type: 'rangeQuery test'
		},
		{
			age: 45,
			type: 'rangeQuery test'
		},
		{
			age: 46,
			type: 'rangeQuery test'
		}], cb);
	});

	it('should work with basic usage', function(cb) {
		User.findAll({
			age: {
				lessThan: 45
			}
		}, function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== 2) throw new Error('Improper # of users returned (' + users.length + ')');
			else cb();
		});
	});
	
});