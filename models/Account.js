Account = Model.extend({
	
	username: STRING,
	password: STRING,
	
	hasMany: [ 'Role' ],
	
	classMethods: {
		hasRole: function (accountId, roleName) {
			// TODO
			return true;
		}
	},
	instanceMethods: {
		doSomethingWithThisInstance: function () {}
	}
});