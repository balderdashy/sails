var _ = require('underscore');
describe('deferred object', function() {

	var testName = 'deferred test';
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

	it('simplest usage should not break', function(cb) {
		User.find({name: testName + '_user' + 0}).done(cb);
	});

	it('singular usage should work', function(cb) {
		User.find({name: testName + '_user' + 0}).done(function(err,result) {
			if(err) throw new Error(err);
			else if(!result) throw new Error('Unexpected result: ' + result);
			else if(_.isEqual(result,origUsers[0])) throw new Error('Incorrect user returned (' + result + ')');
			else cb();
		});
	});

	it('plural usage should work', function(cb) {
		User.findAll({type: testName}).done(function(err,result) {
			if(err) throw new Error(err);
			else if(!result) throw new Error('Unexpected result: ' + result);
			else if(result.length !== origUsers.length) throw new Error('Improper # of users returned (' + result.length + ')');
			else cb();
		});
	});
});