var Example = exports.model = db.model.define('Example', {

	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		unique: true,
		autoIncrement: true
	},

	name: {
		type: Sequelize.STRING,
		unique: true
	}

}, {

	// Relationship with other models
	associate: function () {
	},


	// Special queries for this model
	classMethods: {

	}
});