var Account = exports.model = Model.extend({
	
	username: STRING,
	password: STRING,
	
	hasMany: [ 'Role' 
//		'Policy'
	],
	
	classMethods: {
		doSomething: function() {}
	},
	instanceMethods: {
		doSomethingWithThisInstance: function () {}
	}
});