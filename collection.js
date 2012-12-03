var Collection = module.exports = function(definition) {

	// Sync (depending on scheme)
	switch (collection.scheme) {
		case "drop"	: collection.sync = _.bind(collection.adapter.sync.drop, collection.adapter, collection); break;
		case "alter": collection.sync = _.bind(collection.adapter.sync.alter, collection.adapter, collection); break;
		default		: throw new Error('Invalid scheme in '+collection.identity+' model!');
	}
	
	_.extend(this, definition);

	this.create = function(values, cb) {
		this.adapter.create(this,values,cb);
	};
	this.find = function(criteria, cb) {

	};
	this.update = function(criteria, values, cb) {

	};
	this.destroy = function(criteria, cb) {

	};

	// Bind instance methods to collection
	_.bindAll(this);
};