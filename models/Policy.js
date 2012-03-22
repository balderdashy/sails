var Policy = exports.model = db.model.define('Policy', {

	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		unique: true,
		autoIncrement: true
	},

	controller: {
		type: Sequelize.STRING
	},
	action: {
		type: Sequelize.STRING
	},
	
	// To what kind of thing?
	// Defaults to controller
	targetModel: {
		type: Sequelize.STRING
	},
	
	// To which instance?
	// Usually the id route parameter
	targetInstance: {
		type: Sequelize.INTEGER
	}

}, {

	// Relationship with other models
	associate: function () {
		Policy.hasMany(Account);
		Policy.hasMany(Role);
	},


	// Custom interactions with this model
	classMethods: {}
});