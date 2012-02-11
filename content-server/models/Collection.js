var db = require("../db"),
	Sequelize = db.Sequelize,
	model = db.model;


var Collection = exports.model = model.define('Collection', {
	
	title: Sequelize.STRING,

	description: Sequelize.TEXT
		
}, {
	associations: {
		hasMany: ['Content']
	}
})