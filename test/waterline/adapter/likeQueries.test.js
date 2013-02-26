var _ = require('underscore');

describe('LIKE: basic query usage', function() {
	it ('should return the user with the given name',function (done) {
		var part = 'basic LIKE query test';
		var testName = '24g basic LIKE query test asdcxbzbasg';

		User.create({ name: testName },function (err) {
			if (err) return done(err);
			User.find({
				like: {
					name: part
				}
			},function(err,user) {
				if (err) return done(err); 
				if (!user) return done(new Error('find() with LIKE query returned nothing!'));
				if (user.name !== testName) return done(new Error('find() with LIKE query returned incorrect user!'));
				done(err);
			});
		});
	});

	it ('should support wrapping both sides with a % sign',function (done) {
		var part = 'basic LIKE query test with sign';
		var testName = '24gdddaga4 basic LIKE query test with sign asdcxbzbasg';

		User.create({ name: testName },function (err) {
			if (err) return done(err);
			User.find({
				like: {
					name: '%'+part+'%'
				}
			},function(err,user) {
				if (err) return done(err); 
				if (!user) return done(new Error('find() with LIKE query returned nothing!'));
				if (user.name !== testName) return done(new Error('find() with LIKE query returned incorrect user!'));
				done(err);
			});
		});
	});

});



describe('special LIKE modifiers', function () {
	it ('should support startsWith()',function (done) {
		var part = 'xxj8xrxh!!!r';
		var testName = 'xxj8xrxh!!!r basic startsWith query test';

		User.create({ name: testName },function (err) {
			if (err) return done(err);
			User.startsWith(part,function(err,users) {
				if (err) return done(err); 
				if (!users) return done(new Error('startsWith() query returned nothing!'));
				if (!_.isArray(users)) return done(new Error('startsWith() query returned a non-list!'));
				if (users.length < 1) return done(new Error('startsWith() query returned too few users!'));
				if (users.length > 1) return done(new Error('startsWith() query returned too many users!'));
				if (users[0].name !== testName) return done(new Error('startsWith() query returned incorrect user!'));
				done(err);
			});
		});
	});

	it ('should support contains() (same as LIKE if query doesn\'t contain % signs)',function (done) {
		var part = 'xx3ah4aj8xrxh!!!r';
		var testName = 'xx3ah4aj8xrxh!!!r  basic contains query test';

		User.create({ name: testName },function (err) {
			if (err) return done(err);
			User.contains(part,function(err,users) {
				if (err) return done(err); 
				if (!users) return done(new Error('contains() query returned nothing!'));
				if (!_.isArray(users)) return done(new Error('contains() query returned a non-list!'));
				if (users.length < 1) return done(new Error('contains() query returned too few users!'));
				if (users.length > 1) return done(new Error('contains() query returned too many users!'));
				if (users[0].name !== testName) return done(new Error('contains() query returned incorrect user!'));
				done(err);
			});
		});
	});

	it ('should support endsWith()',function (done) {
		var part = 'xxj8xa4hPFDH';
		var testName = 'basic endsWith query test xxj8xa4hPFDH';

		User.create({ name: testName },function (err) {
			if (err) return done(err);
			User.endsWith(part,function(err,users) {
				if (err) return done(err); 
				if (!users) return done(new Error('endsWith() query returned nothing!'));
				if (!_.isArray(users)) return done(new Error('endsWith() query returned a non-list!'));
				if (users.length < 1) return done(new Error('endsWith() query returned too few users!'));
				if (users.length > 1) return done(new Error('endsWith() query returned too many users!'));
				if (users[0].name !== testName) return done(new Error('endsWith() query returned incorrect user!'));
				done(err);
			});
		});
	});

	it ('should support startsWith() with attributes specified',function (done) {
		var part = 'xxj8xrxh!!!r';
		var testType = 'xxj8xrxh!!!r startsWith with specified attributes';

		User.create({ type: testType },function (err) {
			if (err) return done(err);
			User.startsWith({type: part},function(err,users) {
				if (err) return done(err); 
				if (!users) return done(new Error('startsWith() query returned nothing!'));
				if (!_.isArray(users)) return done(new Error('startsWith() query returned a non-list!'));
				if (users.length < 1) return done(new Error('startsWith() query returned too few users!'));
				if (users.length > 1) return done(new Error('startsWith() query returned too many users!'));
				if (users[0].type !== testType) return done(new Error('startsWith() query returned incorrect user!'));
				done(err);
			});
		});
	});

	it ('should support contains()  with attributes specified',function (done) {
		var part = 'xx3ah4aj8xrxh!!!r';
		var testType = 'and here it is: xx3ah4aj8xrxh!!!r  contains with specified attributes';

		User.create({ type: testType },function (err) {
			if (err) return done(err);
			User.contains({type: part},function(err,users) {
				if (err) return done(err); 
				if (!users) return done(new Error('contains() query returned nothing!'));
				if (!_.isArray(users)) return done(new Error('contains() query returned a non-list!'));
				if (users.length < 1) return done(new Error('contains() query returned too few users!'));
				if (users.length > 1) return done(new Error('contains() query returned too many users!'));
				if (users[0].type !== testType) return done(new Error('contains() query returned incorrect user!'));
				done(err);
			});
		});
	});

	it ('should support endsWith()  with attributes specified',function (done) {
		var part = 'xxj8xa4hPFDH';
		var testType = ' endsWith with specified attributes xxj8xa4hPFDH';

		User.create({ type: testType },function (err) {
			if (err) return done(err);
			User.endsWith({type: part},function(err,users) {
				if (err) return done(err); 
				if (!users) return done(new Error('endsWith() query returned nothing!'));
				if (!_.isArray(users)) return done(new Error('endsWith() query returned a non-list!'));
				if (users.length < 1) return done(new Error('endsWith() query returned too few users!'));
				if (users.length > 1) return done(new Error('endsWith() query returned too many users!'));
				if (users[0].type !== testType) return done(new Error('endsWith() query returned incorrect user!'));
				done(err);
			});
		});
	});

	it ('should support dynamic startsWith()',function (done) {

		var part = 'xxj8xrxh!!!r';
		User.typeStartsWith(part, function (err, usersA) {
			if (err) return done(err); 
			if (!usersA) return done(new Error('StartsWith() query returned nothing!'));
			if (!_.isArray(usersA)) return done(new Error('StartsWith() query returned a non-list!'));
			if (usersA.length < 1) return done(new Error('StartsWith() query returned too few usersA!'));
			if (usersA.length > 1) return done(new Error('StartsWith() query returned too many usersA!'));

			User.nameStartsWith(part, function (err, usersB) {
				if (err) return done(err); 
				if (!usersB) return done(new Error('StartsWith() query returned nothing!'));
				if (!_.isArray(usersB)) return done(new Error('StartsWith() query returned a non-list!'));
				if (usersB.length < 1) return done(new Error('StartsWith() query returned too few usersB!'));
				if (usersB.length > 1) return done(new Error('StartsWith() query returned too many usersB!'));

				done(err);
			});
		});
	});

	it ('should support dynamic endsWith()',function (done) {

		var part = 'xxj8xa4hPFDH';
		User.typeEndsWith(part, function (err, usersA) {
			if (err) return done(err); 
			if (!usersA) return done(new Error('endsWith() query returned nothing!'));
			if (!_.isArray(usersA)) return done(new Error('endsWith() query returned a non-list!'));
			if (usersA.length < 1) return done(new Error('endsWith() query returned too few usersA!'));
			if (usersA.length > 1) return done(new Error('endsWith() query returned too many usersA!'));

			User.nameEndsWith(part, function (err, usersB) {
				if (err) return done(err); 
				if (!usersB) return done(new Error('endsWith() query returned nothing!'));
				if (!_.isArray(usersB)) return done(new Error('endsWith() query returned a non-list!'));
				if (usersB.length < 1) return done(new Error('endsWith() query returned too few usersB!'));
				if (usersB.length > 1) return done(new Error('endsWith() query returned too many usersB!'));

				done(err);
			});
		});
	});

	it ('should support dynamic contains()',function (done) {

		var part = 'xx3ah4aj8xrxh!!!r';
		User.typeContains(part, function (err, usersA) {
			if (err) return done(err); 
			if (!usersA) return done(new Error('contains() query returned nothing!'));
			if (!_.isArray(usersA)) return done(new Error('contains() query returned a non-list!'));
			if (usersA.length < 1) return done(new Error('contains() query returned too few usersA!'));
			if (usersA.length > 1) return done(new Error('contains() query returned too many usersA!'));

			User.nameContains(part, function (err, usersB) {
				if (err) return done(err); 
				if (!usersB) return done(new Error('contains() query returned nothing!'));
				if (!_.isArray(usersB)) return done(new Error('contains() query returned a non-list!'));
				if (usersB.length < 1) return done(new Error('contains() query returned too few usersB!'));
				if (usersB.length > 1) return done(new Error('contains() query returned too many usersB!'));

				done(err);
			});
		});
	});

});


describe('findByLike', function() {

	it('should return the user with the given name', function(done) {
		var part = 'findLike';
		var testName = 'asdgah4 test_findLike asg';

		User.create({ name: testName },function (err) {
			if (err) return done(err);
			User.findLike({name: part},function(err,user) {
				if (err) return done(err); 
				if (!user) return done(new Error('findLike() returned nothing!'));
				if (user.name !== testName) return done(new Error('findLike() returned incorrect user!'));
				done(err);
			});
		});
	});

	it('should return proper user when using string syntax', function(done) {
		var part = 'findLike when using string syntax';
		var testName = 'zzzzz asdgah4 test_ findLike when using string syntax asg';

		User.create({ name: testName },function (err) {
			if (err) return done(err);
			User.findLike(part,function(err,user) {
				if (err) return done(err); 
				if (!user) return done(new Error('findLike() returned nothing!'));
				if (user.name !== testName) return done(new Error('findLike() returned incorrect user!'));
				done(err);
			});
		});
	});
});

describe('findAllLike', function() {

	it('should return the users with the given name', function(done) {
		var part = 'findAllLike';
		var testName = 'zz 340ajsdha test_findAllLike -- aw40gasdha';
		var testName2 = 'zz zzbjfk test_findAllLike2../haer-h';

		User.createEach([{
			name: testName
		}, {
			name: testName2
		}],function (err) {
			if (err) return done(err);
			User.findAllLike({name: part},function(err,users) {
				if (err) return done(err);
				if (users.length < 1) return done(new Error('findAllLike() did not return anything!'));
				if ( !(
						(users[0].name === testName && users[1].name === testName2) ||
						(users[0].name === testName2 && users[1].name === testName)
					)) {
					console.error("\n\n","IS: ",users[0].name,"\n",users[1].name,"\n\n");
					console.error("Should be:",testName,"\n",testName2,"\n\n");
					return done(new Error('findAllLike() returned incorrect user!'));
				}
				done(err);
			});
		});
	});

	it('should return proper users when using string syntax', function(done) {
		var part = 'findAllLike with string syntax';
		var testName = '340ajsdha test_ findAllLike with string syntax  -- aw40gasdha';
		var testName2 = 'zzbjfk test_ findAllLike with string syntax 2../haer-h';

		User.createEach([{
			name: testName
		}, {
			name: testName2
		}],function (err) {
			if (err) return done(err);
			User.findAllLike(part,function(err,users) {
				if (err) return done(err);
				if (users.length < 1) return done(new Error('findAllLike() did not return anything!'));
				if ( !(
						(users[0].name === testName && users[1].name === testName2) ||
						(users[0].name === testName2 && users[1].name === testName)
					)) {
					console.error("\n\n","IS: ",users[0].name,"\n",users[1].name,"\n\n");
					console.error("Should be:",testName,"\n",testName2,"\n\n");
					return done(new Error('findAllLike() returned incorrect user!'));
				}
				done(err);
			});
		});
	});
});