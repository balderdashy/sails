var _ = require('underscore');
describe('limit', function() {

	var testName = 'limit test';
	var limit = 3;
	var users = [];
	_.each(_.range(10), function(i) {
		users.push({
			name: testName + '_user' + i,
			type: testName
		});
	});

	it ('prepares tests',function(cb) {
		User.createEach(users, cb);
	});

	it('normal usage should not break', function(cb) {

		User.findAll({
			where: {
				type: 'limit test'
			},
			limit: 10
		}, cb);
	});

	it('dynamic finder usage should not break', function(cb) {
		User.findAllByType('limit test', {
			limit: 10
		}, cb);
	});

	it('secondary usage should not break', function(cb) {
		User.findAll({
			where: {
				type: 'limit test'
			}
		}, {
			limit: 10
		}, cb);
	});

	it('it should effectively limit the number of things returned', function(cb) {
		User.findAllByType(testName, {
			limit: limit
		}, function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== limit) throw new Error('Improper # of users returned (' + users.length + ')');
			else cb();
		});
	});

	it('chained limit should work', function(cb) {
		var limit = 3;
		User.findAll({type: testName}).limit(limit).done(function(err,result) {
			if(err) throw new Error(err);
			else if(!result) throw new Error('Unexpected result: ' + result);
			else if(result.length !== limit) throw new Error('Improper # of users returned (' + result.length + ')');
			else cb();
		});
	});

	it('chain-breaking usage of chained limit should work', function(cb) {
		User.findAllByType(testName).limit(limit, function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== limit) throw new Error('Improper # of users returned (' + users.length + ')');
			else cb();
		});
	});

	
});