Account = Model.extend({
	
	username: STRING,
	password: STRING,
	
	hasMany: [ 'Role' ],
	
	classMethods: {
		doSomething: function() {}
	},
	instanceMethods: {
		doSomethingWithThisInstance: function () {}
	}
});