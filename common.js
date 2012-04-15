/**
 * 
 * Utility logic for use throughout application
 * 
 */








// Add capitalization method to String class
String.prototype.toCapitalized = function ()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
}



// Data type constants
STRING = Sequelize.STRING;
INTEGER = Sequelize.INTEGER;


// Prototype Model object
Model = {
	
	// Create a new domain class
	extend: function (classObject) {
		// Set up namespace isolated from Sequelize proper
		this.sails = {};
		
		// Parse fields
		this.sails.fields = {};
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
			})) {
				this.sails.fields[propertyName] = {
					type: type
				};
			}
		}, this);
		
		// parse options
		this.sails.options = {
			classMethods: _.clone(classObject.classMethods),
			instanceMethods: _.clone(classObject.instanceMethods)
		}
		
		// Prepare assocations
		this.sails.hasMany = _.clone(classObject.hasMany);
		this.sails.hasOne = _.clone(classObject.hasOne);
		this.sails.belongsTo = _.clone(classObject.belongsTo);
		
		return _.extend(classObject,this);
	},
	
	
	// Set up the new domain class to actually do something with the orm
	initialize: function (modelName) {
		// Remember name
		this.sails.modelName = modelName;
		
		// Build actual model using ORM
		return _.extend(this,db.model.define(modelName,this.sails.fields,this.sails.options));
	},
	
	// create associations
	createAssociations: function () {
		_.each(this.sails.hasMany,function(associatedDomain) {
			if (!global[associatedDomain]) {
				throw Error('You\'re trying to make an assocation with a model ('+associatedDomain+') that doesn\'t exist!');
			}
			console.log("TRYING TO HASMANY: ",this.sails.modelName + " -> " + associatedDomain);
			debug.debug("FOREIGN DOMAIN CLASS:\n",global[associatedDomain]);
			debug.debug("MY DOMAIN CLASS:\n",global[this.sails.modelName]);
			global[this.sails.modelName].hasMany(global[associatedDomain],{});
		}, this);
		_.each(this.sails.hasOne,function(associatedDomain) {
			if (!global[associatedDomain]) {
				throw Error('You\'re trying to make an assocation with a model ('+associatedDomain+') that doesn\'t exist!');
			}
			global[this.sails.modelName].hasOne(global[associatedDomain]);
		}, this);
		_.each(this.sails.belongsTo,function(associatedDomain) {
			if (!global[associatedDomain]) {
				throw Error('You\'re trying to make an assocation with a model ('+associatedDomain+') that doesn\'t exist!');
			}
			global[this.sails.modelName].belongsTo(global[associatedDomain]);
		}, this);
		
		console.log("\n\n\n\nMADE IT",this.sails.modelName);
	}
}
