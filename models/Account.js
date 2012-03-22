// Represents a user account with the application
var Account = exports.model = db.model.define('Account', {

	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		unique: true,
		autoIncrement: true
	},

	username: {
		type: Sequelize.STRING
	},
	password: {
		type: Sequelize.STRING
	}

}, {

	// Relationship with other models
	associate: function () {
		Account.hasMany(Role);
		Account.hasMany(Policy);
	},


	// Custom interactions with this model
	classMethods: {}
});