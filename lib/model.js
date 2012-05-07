
// Data type constants
STRING = Sequelize.STRING;
INTEGER = Sequelize.INTEGER;


// Prototype Model object
Model = function () {}
	
// Create a new domain class
Model.extend = function (classObject) {
		
	var instance = new Model;
		
	// Parse fields
	instance.fields = {};
	_.each(classObject,function (type,propertyName) {
		if (_.any([
			Sequelize.STRING,
			Sequelize.TEXT,
			Sequelize.INTEGER,
			Sequelize.FLOAT,
			Sequelize.BOOLEAN,
			Sequelize.DATE
			],function(dataType) {
				return type == dataType;
			})
		) {
			instance.fields[propertyName] = {
				type: type
			};
		}
	});
		
	// parse options
	instance.options = {
		classMethods: _.clone(classObject.classMethods),
		instanceMethods: _.clone(classObject.instanceMethods)
	}
		
	// Prepare assocations
	instance.options.hasMany = _.clone(classObject.hasMany);
	instance.options.hasOne = _.clone(classObject.hasOne);
	instance.options.belongsTo = _.clone(classObject.belongsTo);
		
	return _.extend(instance,classObject);
};
	
	
// Set up the new domain class to actually do something with the orm
Model.prototype.initialize = function (modelName) {	
	// Build actual model using ORM
	return db.model.define(modelName,this.fields,this.options);
};
	
// create associations
Model.createAssociations = function (model) {
	_.each(model.options.hasMany,function(associatedModelName) {
		if (!global[associatedModelName]) {
			throw Error('You\'re trying to make an assocation with a model ('+associatedModelName+') that doesn\'t exist!');
		}
		model.hasMany(global[associatedModelName]);
	}, this);
	_.each(model.options.hasOne,function(associatedModelName) {
		if (!global[associatedModelName]) {
			throw Error('You\'re trying to make an assocation with a model ('+associatedModelName+') that doesn\'t exist!');
		}
		model.hasOne(global[associatedModelName]);
	}, this);
	_.each(model.options.belongsTo,function(associatedModelName) {
		if (!global[associatedModelName]) {
			throw Error('You\'re trying to make an assocation with a model ('+associatedModelName+') that doesn\'t exist!');
		}
		model.belongsTo(global[associatedModelName]);
	}, this);
}