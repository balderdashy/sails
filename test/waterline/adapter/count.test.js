var _ = require('underscore');
describe('count', function() {

	var testName = 'count test';
	var origUsers = [];
	_.each(_.range(10), function(i) {
		origUsers.push({
			name: testName + '_user' + i,
			type: testName
		}); 
	});

	it ('prepares tests',function(cb) {
		User.createEach(origUsers, cb);
	});

	it('normal usage should not break', function(cb) {
		User.count({
			type: testName
		}, cb);
	});

	it('dynamic finder usage should not break', function(cb) {
		User.countByType(testName, cb);
	});

	it('it should effectively count the number of things', function(cb) {
		User.countByType(testName, function(err, count) {
			if(err) throw new Error(err);
			else if(!count) throw new Error('Unexpected result: ' + count);
			else if(count !== origUsers.length) throw new Error('Improper # of users returned (' + count + ')');
			else cb();
		});
	});
});