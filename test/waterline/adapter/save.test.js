// var _ = require('underscore');

// describe('basic model.save() usage', function(cb) {

// 	var testName = 'basic test to see if model is getting decorated properly ';

// 	before(function(cb) {
// 		User.createEach([{
// 			age: 40,
// 			name: testName
// 		}, {
// 			age: 44,
// 			name: testName
// 		}, {
// 			age: 45,
// 			name: testName
// 		}, {
// 			age: 46,
// 			name: testName
// 		}], cb);
// 	});

// 	it('findAll() should return models with save() and destroy() methods', function(cb) {
// 		User.findAll({
// 			name: testName
// 		}, checkListResult(4, checkForModelMethods(cb)));
// 	});

// 	it('find() should return models with save() and destroy() methods', function(cb) {
// 		User.find({
// 			name: testName,
// 			age: 40
// 		}, checkForModelMethods(cb));
// 	});

// 	it('create() should return models with save() and destroy() methods', function(cb) {
// 		User.create({
// 			name: testName,
// 			age: 99
// 		}, checkForModelMethods(cb));
// 	});

// 	it('update() should return models with save() and destroy() methods', function(cb) {
// 		User.update({
// 			name: testName,
// 			age: 99
// 		}, {
// 			age: 101
// 		}, checkForModelMethods(cb));
// 	});

// 	it('findOrCreate() should return models with save() and destroy() methods', function(cb) {
// 		User.findOrCreate({
// 			age: 101
// 		}, checkForModelMethods(cb));
// 	});
// });


// describe('correctness of model.save() functionality', function(cb) {

// 	var testName = 'model.save() functionality test';

// 	before(function(cb) {
// 		User.createEach([{
// 			age: 1,
// 			name: testName
// 		}, {
// 			age: 2,
// 			name: testName
// 		}], cb);
// 	});

// 	it('save() should update existing model', function(cb) {
// 		User.find({
// 			age: 1,
// 			name: testName
// 		}, function (err, user) {
// 			if (err) return cb(err);

// 			user.age = 100;
// 			user.save(function (err, user) {
// 				if (err) return cb(err);

// 				console.log(user);
				
// 				// TODO: make sure this actually works
// 				if (user.age !== 100) return cb("Incorrect age saved.");
// 				else return cb(err, user);
// 			});
// 		});
// 	});

// });

// function checkListResult(expectedLength, cb) {
// 	return function(err, users) {
// 		if(err) throw new Error(err);
// 		else if(!users) throw new Error('Unexpected result: ' + users);
// 		else if(users.length !== expectedLength) throw new Error('Improper # of users returned (' + users.length + ')');
// 		else cb(err, users);
// 	};
// }

// function checkForModelMethods(cb) {
// 	return function (err, set) {
// 		if (err) throw new Error(err);
// 		else if (_.isArray(set)) {
// 			if (! _.all(set, function (model) {
// 				return _.isFunction(model.save) && _.isFunction(model.destroy);
// 			})) throw new Error ("save() not defined on model!");
// 			else cb(err,set);
// 		}
// 		else if (_.isObject(set)) {
// 			if (!_.isFunction(set.save) && _.isFunction(model.destroy)) throw new Error ("save() not defined on model!");
// 			else cb(err, set);
// 		}
// 		else throw new Error ('Unexpected result: ' + set);
// 	};
// }