var _ = require('underscore');
describe ('query edge cases',function () {
	describe ('find', function () {

		it ('should return first model when no criteria provided', function (cb) {
			User.find(function (err,user) {
				if(err) throw new Error(err);
				else if(!user) throw new Error('Unexpected result: ' + users);
				else cb();
			});
		});
	});

	describe('findAll',function () {
		var users = [{name:'a'},{name:'b'},{name:'c'}];
		_.map(users,function (user) {
			return user.type = 'test_findAll_edgeCase';
		});

		it ('should return all models when no criteria provided', function (cb) {
			User.findAll(function (err,users0) {
				if(err) throw new Error(err);
				else if(!users) throw new Error('Unexpected result: ' + users1);

				User.findAll(function (err,users1) {
					if(err) throw new Error(err);
					else if(!users) throw new Error('Unexpected result: ' + users1);
					else if(users0.length !== users1.length) throw new Error('Improper # of users returned (' + users.length + ')');
					else cb();
				});
			});
		});
	});
});