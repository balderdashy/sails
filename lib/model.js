
// Data type constants
STRING	= VARCHAR = Sequelize.STRING;
TEXT	= Sequelize.TEXT;
FLOAT	= Sequelize.FLOAT;
BOOLEAN	= Sequelize.BOOLEAN;
DATE	= Sequelize.DATE;
INTEGER	= Sequelize.INTEGER;

// include default methods
var defaultInstanceMethods = {
	
}
var defaultClassMethods = {
	
	/**
	 * Retrieve models whose keyAttributes match all of the specified attributes,
	 * otherwise, create them (use Domain.createAll() if necessary)
	 * 
	 * Rather than using the non-standard Sequelize format, the callback function 
	 * is in the form of function (err,results) {}
	 */
	findOrCreate: function (attributes,keyAttributes,callback) {
		var Domain = global[this.name];
		var criteria = {};
		_.each(keyAttributes,function(keyAttributeName,index){
			criteria[keyAttributeName] = attributes[keyAttributeName];
		});
		Domain.find({where:criteria}).success(function(model){
			if (model) {
				callback(null,model);
			}
			else {
				Domain.createAll(attributes).success(_u.cbok(callback)).error(callback);
			}
		}).error(callback);
	},
	
	/**
	 * Create a model with the specified attributes
	 * If an attribute is a list, create a model for each item in the list
	 * 
	 * Rather than using the non-standard Sequelize format, the callback function 
	 * is in the form of function (err,results) {}
	 */
	createAll: function (attributes,callback) {
		var Domain = global[this.name];
		
		// TODO: nested loop, foreach attribute, foreach item in list
		createOne(attributes,callback);
		
		// Create a single model
		function createOne (theseAttrs,c) {
			Domain.create(theseAttrs).success(_u.cbok(c)).error(c);
		}
	}
}


// Prototype Model object
Model = function () {}
	
// Deep clone
Model.clone = function(property) {
	var newProp = _.clone(property);
	newProp.validate = {};
	_.each(property.validate,function(val,key) {
		newProp.validate[key]=val;
	});
	return newProp;
}	
	
// Create a new domain class
Model.extend = function (classObject) {
		
	var instance = new Model;
		
	// Parse fields
	instance.fields = {};
	_.each(classObject,function (val,propertyName) {
		
		// Naked property
		if (_.any([
			Sequelize.STRING,
			Sequelize.TEXT,
			Sequelize.INTEGER,
			Sequelize.FLOAT,
			Sequelize.BOOLEAN,
			Sequelize.DATE
			],function(dataType) {
				return val == dataType;
			})
		) {
			instance.fields[propertyName] = {
				type: val
			};
		}
		// Property w/ options
		else if (_.isObject(val) && val.type && _.any([
			Sequelize.STRING,
			Sequelize.TEXT,
			Sequelize.INTEGER,
			Sequelize.FLOAT,
			Sequelize.BOOLEAN,
			Sequelize.DATE
			],function(dataType) {
				return val.type == dataType;
			})
		) {
			instance.fields[propertyName] = Model.clone(val);
		}
		else {
		}
	});
		
	// parse options
	instance.options = {
		classMethods: _.extend(_.clone(classObject.classMethods), defaultClassMethods),
		instanceMethods: _.extend(_.clone(classObject.instanceMethods),defaultInstanceMethods)
	}
		
	// Prepare assocations
	instance.options.hasMany = _.clone(classObject.hasMany);
	instance.options.hasOne = _.clone(classObject.hasOne);
	instance.options.belongsTo = _.clone(classObject.belongsTo);
		
		
		
	// Disable pluralization (this gets annoying VERY fast)
	instance.options.freezeTableName = true;
		
	return _.extend(instance,classObject);
};
	
	
// Set up the new domain class to actually do something with the orm
Model.prototype.initialize = function (modelName) {	
	// Build actual model using ORM
	var m = db.model.define(modelName,this.fields,this.options);
	return m;
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