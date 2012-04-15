var Role = exports.model = Model.extend({
	
	nameJ: STRING,
	
	belongsTo: [ 
		'Account'
////		'Tenant'
	],
	hasMany: [ 
		'Account'
//		'Policy'
	],
	
	classMethods: {
		doSomeqething: function() {}
	},
	instanceMethods: {
		doSomethinqtqewgWithThisInstance: function () {}
	}
});