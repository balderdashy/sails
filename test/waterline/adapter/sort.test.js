var _ = require('underscore');
describe('sort', function() {

	var testName = 'sort test';
	var origUsers = [];
	_.each(_.range(10), function(i) {
		origUsers.push({
			name: testName + '_user' + i,
			type: testName,
			// Random phone number
			phone: Math.round(Math.random()*999) + "-"+ Math.round(Math.random()*999) + "-" + Math.round(Math.random()*9999)
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
			sort: {
				phone: 1
			}
		}, cb);
	});

	it('secondary usage should not break', function(cb) {
		User.findAll({type: testName}, {sort: { phone: 1 }}, cb);
	});

	it('dynamic finder usage should not break', function(cb) {
		User.findAllByType(testName, { sort: { phone: 1 } }, cb);
	});

	it('string attrName ASC usage should not break', function(cb) {
		User.findAllByType(testName, { sort: 'phone ASC' }, cb);
	});

	it('string attrName usage should not break', function(cb) {
		User.findAllByType(testName, { sort: 'phone' }, cb);
	});

	it('sort by date should work', function(cb) {

		// Stall a second or so, then 
		setTimeout(function () {
			// update one of the models so the updatedAt will change
			User.update({
				name:  testName + '_user2'
			}, {}, function (err) {
				if (err) throw new Error(err);

				// Get sorted models
				User.findAllByType(testName, { sort: 'updatedAt' }, function (err, users) {
					var returnedFromWaterline = _.clone(users);
					var originals = _.clone(origUsers);

					// Make sure the order has changed
					if (_.isEqual(originals, returnedFromWaterline)) {
						throw new Error('updatedAt not sorted properly.');
					}
					cb(err);
				});
			});
		}, 1001);
	});


	it('it should effectively sort the list (ASC)', function(cb) {
		User.findAllByType(testName, { sort: 'phone ASC' }, function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length) throw new Error('Improper # of users returned (' + users + ')');
			else {
				if (! isSorted(users, 'phone', 1)) cb(new Error('Users not properly sorted!'));
				else cb();
			}
		});
	});

	it('it should effectively sort the list (DESC)', function(cb) {
		User.findAllByType(testName, { sort: 'phone DESC' }, function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length) throw new Error('Improper # of users returned (' + users + ')');
			else {
				if (! isSorted(users, 'phone', -1)) cb(new Error('Users not properly sorted!'));
				else cb();
			}
		});
	});

	it('chained usage + dynamic finder should effectively sort the list (ASC)', function(cb) {
		User.findAllByType(testName).sort('phone ASC').done(function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length) throw new Error('Improper # of users returned (' + users + ')');
			else {
				if (! isSorted(users, 'phone', 1)) cb(new Error('Users not properly sorted!'));
				else cb();
			}
		});
	});

	it('chained usage + dynamic finder should effectively sort the list (DESC)', function(cb) {
		User.findAllByType(testName).sort('phone DESC').done(function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length) throw new Error('Improper # of users returned (' + users + ')');
			else {
				if (! isSorted(users, 'phone', -1)) cb(new Error('Users not properly sorted!'));
				else cb();
			}
		});
	});

	it('chain-breaking usage + dynamic finder should effectively sort the list (ASC)', function(cb) {
		User.findAllByType(testName).sort('phone ASC',function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length) throw new Error('Improper # of users returned (' + users + ')');
			else {
				if (! isSorted(users, 'phone', 1)) cb(new Error('Users not properly sorted!'));
				else cb();
			}
		});
	});

	it('chain-breaking usage + dynamic finder should effectively sort the list (DESC)', function(cb) {
		User.findAllByType(testName).sort('phone DESC', function(err, users) {
			if(err) throw new Error(err);
			else if(!users) throw new Error('Unexpected result: ' + users);
			else if(users.length !== origUsers.length) throw new Error('Improper # of users returned (' + users + ')');
			else {
				if (! isSorted(users, 'phone', -1)) cb(new Error('Users not properly sorted!'));
				else cb();
			}
		});
	});
});

function isSorted (list, attrName, direction) {
	var lastItem;
	return _.all(list,function (thisItem) {
		var ok;
		if (!lastItem) ok = true;
		else if (direction === 1) ok = lastItem[attrName] <= thisItem[attrName];
		else if (direction === -1) ok = lastItem[attrName] >= thisItem[attrName];
		lastItem = thisItem;
		return ok;
	});
}