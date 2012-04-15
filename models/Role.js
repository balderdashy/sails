Role = Model.extend({
	
	name: STRING,
	
	hasMany: [ 'Account' ],
	
	classMethods: {},
	instanceMethods: {}
});