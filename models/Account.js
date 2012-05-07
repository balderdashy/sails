Account = Model.extend({
	
	username: STRING,
	password: STRING,
	
	hasMany: [ 'Role' ],
	
	classMethods: {
		
		// If this account has the specified Role, run thenCallback
		// otherwise perform the elseCallback
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
		
		setRoleByName: function(roleName,callback) {
			if (!roleName) return callback();
			
			var self = this;
			Role.find({where: {name: roleName}}).success(function(role){
				if (role) {
					self.setRoles([role]).success(function(){
						callback();
					});
				}
				else {
					throw new Error ("No such role ('"+roleName+"') exists!");
				}
			})
		},
		
		doSomethingWithThisInstance: function () {}
	}
});