var _ = require('underscore');
var parley = require('parley');

var Collection = module.exports = function(definition) {

	// Sync (depending on scheme)
	definition.scheme = definition.scheme || 'alter';
	switch (definition.scheme) {
		case "drop"	: definition.sync = _.bind(definition.adapter.sync.drop, definition.adapter, definition); break;
		case "alter": definition.sync = _.bind(definition.adapter.sync.alter, definition.adapter, definition); break;
		
		// Not having a scheme is not an error, just default to alter
		// default		: throw new Error('Invalid scheme in '+definition.identity+' model!');
	}
	
	// Absorb definition methods
	_.extend(this, definition);

	// Define core methods
	this.create = function(values, cb) {
		var collection = this;

		// Get status to get value of auto_increment counter
		if (collection.adapter.status) {
			collection.adapter.status(collection.identity,afterwards);
		}
		else afterwards();

		// Modify values as necessary
		function afterwards(err,status){
			if (err) throw err;

			// Auto increment fields that need it
			collection.adapter.autoIncrement(collection.identity,values,function (err,values) {
				if (err) return cb(err);

				// TODO: Verify constraints using (HULL)

				// Add updatedAt and createdAt
				if (collection.adapter.config.createdAt) values.createdAt = new Date();
				if (collection.adapter.config.updatedAt) values.updatedAt = new Date();

				// Call create method in adapter
				return collection.adapter.create(collection.identity,values,cb);
			});
		}
	};
	// Call find method in adapter
	this.find = function(options, cb) {
		return this.adapter.find(this.identity,options,cb);
	};
	// Call update method in adapter
	this.update = function(criteria, values, cb) {
		return this.adapter.update(this.identity,criteria,values,cb);
	};
	// Call destroy method in adapter
	this.destroy = function(criteria, cb) {
		return this.adapter.destroy(this.identity,criteria,cb);
	};

	this.findOrCreate = function (criteria, values, cb) { 
		return this.adapter.findOrCreate(this.identity,criteria,values,cb);
	};
	this.findAndUpdate = function (criteria, values, cb) { 
		return this.adapter.findAndUpdate(this.identity, criteria, values, cb); 
	};
	this.findAndDestroy = function (criteria, cb) { 
		return this.adapter.findAndDestroy(this.identity, criteria, cb); 
	};

	this.lock = function(criteria, cb) {
		return this.adapter.lock(this.identity,criteria,cb);
	};
	this.unlock = function(criteria, cb) {
		return this.adapter.unlock(this.identity,criteria,cb);
	};

	//////////////////////////////////////////
	// Utility methods
	//////////////////////////////////////////

	// Return a trimmed set of the specified attributes
	// with only the attributes which actually exist in the server-side model
	this.filter = function(params) {
		var trimmedParams = _.objFilter(params, function(value, name) {
			return _.contains(_.keys(this.attributes), name);
		}, this);
		return trimmedParams;
	};
	this.trimParams = this.filter;

	// Bind instance methods to collection
	_.bindAll(definition);
	_.bindAll(this);
};