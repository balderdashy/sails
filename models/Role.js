var Role = exports.model = Model.extend({
	
	name: STRING,
	
	belongsTo: [ 
		'Account', 
//		'Tenant'
	],
	hasMany: [ 
//		'Policy'
	],
	
	classMethods: {
		doSomething: function() {}
	},
	instanceMethods: {
		doSomethingWithThisInstance: function () {}
	}
});