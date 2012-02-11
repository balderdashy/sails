var Collection = exports.model = db.model.define('Collection', {
	
	title: Sequelize.STRING,

	description: Sequelize.TEXT
		
}, {
	associate: function () {
		Collection.hasMany(Content);
	}
})