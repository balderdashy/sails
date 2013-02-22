var _ = require('underscore');
describe('skip', function() {

	var testName = 'skip test';
	var skip = 3;
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

		User.findAll({
			where: {
				type: testName
			},
			skip: skip
		}, cb);
	});

	it('dynamic finder usage should not break', function(cb) {
		User.findAllByType(testName, {
			skip: skip
		}, cb);
	});

	it('secondary usage should not break', function(cb) {
		User.findAll({
			where: {
				type: testName
			}
		}, {
			skip: skip
		}, cb);
	});

	it('it should effectively skip the number of things returned', function(cb) {
		User.findAllByType(testName, {
			skip: skip
		}, function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length-skip) throw new Error('Improper # of users returned (' + users.length + ')');
			else cb();
		});
	});

	it('chained usage should not break', function (cb) {
		User.findAll({type: testName}).skip(skip).done(function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length-skip) throw new Error('Improper # of users returned (' + users.length + ')');
			else cb();
		});
	});

	it('chained usage in dynamicFinder should work', function(cb) {
		User.findAllByType(testName).skip(skip).done(function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length-skip) throw new Error('Improper # of users returned (' + users.length + ')');
			else cb();
		});
	});

	it('chain-breaking chained usage in dynamicFinder should work', function(cb) {
		User.findAllByType(testName).skip(skip,function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length-skip) throw new Error('Improper # of users returned (' + users.length + ')');
			else cb();
		});
	});


});