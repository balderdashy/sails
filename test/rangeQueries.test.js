var _ = require('underscore');
describe('lessThan', function() {

	var testName = 'lessThan test';

	it('should work with basic usage', function(cb) {
		User.findAll(testName, {
			age: {
				lessThan: 45
			}
		}, function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== limit) throw new Error('Improper # of users returned (' + users.length + ')');
			else cb();
		});
	});
	
});