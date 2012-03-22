// Represents a relationship between an account and a tenant
var Role = exports.model = db.model.define('Role', {

	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		unique: true,
		autoIncrement: true
	},

	name: {
		type: Sequelize.STRING
	}

}, {

	// Relationship with other models
	associate: function () {
		Role.belongsTo(Account)
		Role.belongsTo(Tenant)
		
		Role.hasMany(Policy)
	},


	// Custom interactions with this model
	classMethods: {}
});