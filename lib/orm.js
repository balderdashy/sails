
// Data type constants
STRING	= VARCHAR = Sequelize.STRING;
TEXT	= Sequelize.TEXT;
FLOAT	= Sequelize.FLOAT;
BOOLEAN	= Sequelize.BOOLEAN;
DATE	= Sequelize.DATE;
INTEGER	= Sequelize.INTEGER;

// include default methods
var defaultInstanceMethods = {
	
	// Subscribe to instance room
	subscribe: function(req,res){
		req.isSocket && req.socket.join(_.str.trim(this.instanceRoom,'/'));
	},
	
	// Unsubscribe from instance room
	unsubscribe: function(req,res){
		req.isSocket && req.socket.leave(_.str.trim(this.instanceRoom,'/'));
	},
	
	// Publish event to instance room
	publish: function (req,res,message) {
		req.isSocket && req.socket.broadcast.to(_.str.trim(this.instanceRoom,'/')).json.send(message);
	},
	
	/**
	 * Returns the name of this model class as a string
	 */
	getModelName: function() {
		return this.__factory.name.toLowerCase();
	}
	
};

var defaultClassMethods = {
	
	// Return a trimmed set of the specified parameters 
	// with only the attributes which actually exist in the server-side model
	trimParams: function (params) {
		var trimmedParams = _.objFilter(params,function(value,name) {
			return _.contains(_.keys(this.rawAttributes),name);
		},this);
		return trimmedParams;
	},
	
	// Subscribe to global room covering all events on this model
	subscribe: function(req,res){
		req.isSocket && req.socket.join(_.str.trim(this.classeRoom,'/'));
	},
	
	// Unsubscribe from global room covering all events on this model
	unsubscribe: function(req,res){
		req.isSocket && req.socket.leave(_.str.trim(this.classeRoom,'/'));
	},
	
	// Publish event to global room
	publish: function (req,res,message) {
		req.isSocket && req.socket.broadcast.to(_.str.trim(this.classeRoom,'/')).json.send(message);
	},
	
	/**
	 * Returns the name of this model class as a string
	 */
	getModelName: function() {
		return this.name.toLowerCase();
	},
	
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
		Domain.find({
			where:criteria
		}).success(function(model){
			if (model) {
				callback(null,model);
			}
			else {
				if (_.any(attributes,function(val,key){
					return _.isArray(val);
				})) {
					Domain.createAll(attributes, callback);
				}
				else {
					Domain.create(attributes).success(_.unprefix(callback));
				}
			}
		}).error(callback);
	},
	
	/**
	 * Retrieve models which match `where`, then update them with `newValues`
	 * 
	 * Rather than using the non-standard Sequelize format, the callback function 
	 * is in the form of function (err,results) {}
	 */
	findAndUpdate: function (where,newAttributes,callback) {
		var Domain = global[this.name];
		Domain.findAll({
			where:where
		}).success(function(collection){
			if (collection) {
				if (_.isArray(collection)) {
					Domain.updateAll(collection, newAttributes, callback);
				}
				else {
					collection.updateAttributes(newAttributes).
					success(_.unprefix(callback)).
					error(callback);
				}
			}
			else {
				callback(null,collection);
			}
		}).error(callback);
	},
	
	/**
	 * Retrieve models which match `where`, then delete them
	 * 
	 * Rather than using the non-standard Sequelize format, the callback function 
	 * is in the form of function (err,results) {}
	 */
	findAndDelete: function (where,callback) {

		// Handle *where* argument which is specified as an integer
		if (_.isFinite(+where)) {
			where = {
				id: where
			};
		}

		var Domain = global[this.name];
		Domain.findAll({
			where:where
		}).success(function(collection) {
			if (collection) {
				if (_.isArray(collection)) {
					Domain.deleteAll(collection, callback);
				}
				else {
					collection.destroy().
					success(_.unprefix(callback)).
					error(callback);
				}
			}
			else {
				callback(null,collection);
			}
		}).error(callback);
	},
	
	/**
	 * Update all `models` with `newAttributes` using the query chainer
	 */
	updateAll: function (models,newAttributes,callback) {
		var chainer = new Sequelize.Utils.QueryChainer();
		_.each(models,function(m,index) {
			chainer.add(m.updateAttributes(newAttributes));
		});
		chainer.run().success(_.unprefix(callback)).error(callback);
	},
	
	/**
	 * Delete all `models` using the query chainer
	 */
	deleteAll: function (models,callback) {
		var chainer = new Sequelize.Utils.QueryChainer();
		_.each(models,function(m,index) {
			chainer.add(m.destroy());
		});
		chainer.run().success(_.unprefix(callback)).error(callback);
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
		
		var models = [];
		linearize(attributes,models);
		
		// Reduce into a set of attributes with only
		// one value per-attribute
		function linearize( attrs, attrSets ) {
			// Base case:
			// If there is one value per attribute, add this permutation to the result list
			if (_.all(attrs,function(v,k){
				return !_.isArray(v);
			})) {
				attrSets.push(attrs);
			}
			
			// Otherwise, recursively call this function on each of the value options
			else {
				_.each(attrs,function(attrVal,attrName) {
					
					// If this attribute is a list
					if (_.isArray(attrVal)) {	
						
						// recursively call linearize() with each value from the list
						_.each(attrVal,function(val,index) {
							var model = _.clone(attrs);
							model[attrName] = val;
							linearize(model,attrSets);
						});
					}
				});
			}
		}
		
		// Create all of the models using the query chainer
		var chainer = new Sequelize.Utils.QueryChainer();
		_.each(models,function(m,index) {
			chainer.add(Domain.create(m));
		});
		chainer.run().success(_u.cbok(callback)).error(callback);
	}
};


// Prototype Model object
Model = function () {};
	
// Deep clone
Model.clone = function(property) {
	var newProp = _.clone(property);
	newProp.validate = {};
	_.each(property.validate,function(val,key) {
		newProp.validate[key]=val;
	});
	return newProp;
};
	
// Create a new domain class
Model.extend = function (classObject) {
		
	var instance = new Model();
		
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
		classMethods: _.defaults(classObject.classMethods || {},defaultClassMethods),
		instanceMethods: _.defaults(classObject.instanceMethods || {},defaultInstanceMethods),
		
		// Prepare assocations
		hasMany: _.clone(classObject.hasMany),
		hasOne: _.clone(classObject.hasOne),
		belongsTo: _.clone(classObject.belongsTo),
		
		// Disable pluralization (this gets annoying VERY fast)
		freezeTableName: true
	};
	
	// return instance;
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
};