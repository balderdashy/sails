// var _=require('underscore');
// describe('skip', function() {
// 	var limit = 3;
	
// 	it('normal usage should not break', function(cb) {
// 		User.find({
// 			where: {
// 				type: 'limit test'
// 			},
// 			skip: 10
// 		}, cb);
// 	});

// 	it('dynamic finder usage should not break', function(cb) {
// 		User.findByType('limit test', {
// 			limit: 10
// 		}, cb);
// 	});

// 	it('secondary usage should not break', function(cb) {
// 		User.find({
// 			where: {
// 				type: 'limit test'
// 			}
// 		}, {
// 			limit: 10
// 		}, cb);
// 	});

// 	it('it should effectively limit the number of things returned', function(cb) {
// 		var testName = 'true limit test';
// 		var users = [];
// 		_.each(_.range(10),function (i) {
// 			users.push({name: testName+'_user'+i, type: testName});
// 		});

		
// 			User.findAllByType(testName, {
// 				limit: limit
// 			}, function (err, users) {
// 				if (err) throw new Error(err);
// 				else if (!users) throw new Error('Unexpected result: '+users);
// 				else if (users.length !== limit) throw new Error('Improper # of users returned ('+users.length+')');
// 				else cb();
// 			});
// 		});
// 	});


// });