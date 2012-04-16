Account = Model.extend({
	
	username: STRING,
	password: STRING,
	
	hasMany: [ 'Role' ],
	
	classMethods: {
		
		
		hasRole: function (accountId, roleName,thenCallback,elseCallback) {
			if (!accountId) {
				return elseCallback();
			}
			
			Account.find(accountId).success(function(account){
				account.getRoles().success(function(roles) {
					_.any(roles,function(role) {
						return role.name == roleName;
					}) ? thenCallback() : elseCallback();
				})
			});
		}
	},
	instanceMethods: {
		doSomethingWithThisInstance: function () {}
	}
});