var Account = exports.model = Model.extend({
	
	username: STRING,
	password: STRING,
	
//	hasMany: [ 'Role', 'Policy' ],
	
	classMethods: {
		doThings: function(){}
	}
});