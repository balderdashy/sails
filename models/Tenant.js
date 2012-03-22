// Represents a unit of ownership
var Tenant = exports.model = db.model.define('Tenant', {

	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		unique: true,
		autoIncrement: true
	},

	username: {
		type: Sequelize.STRING
	}

}, {

	// Relationship with other models
	associate: function () {
		Tenant.hasMany(Role);
	},


	// Custom interactions with this model
	classMethods: {}
});