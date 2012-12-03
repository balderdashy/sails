var _ = require('underscore');
var parley = require('parley');

var Collection = module.exports = function(definition) {

	// Sync (depending on scheme)
	switch (definition.scheme) {
		case "drop"	: definition.sync = _.bind(definition.adapter.sync.drop, definition.adapter, definition); break;
		case "alter": definition.sync = _.bind(definition.adapter.sync.alter, definition.adapter, definition); break;
		default		: throw new Error('Invalid scheme in '+definition.identity+' model!');
	}
	
	// Absorb definition methods
	_.extend(this, definition);

	// Define core methods
	this.create = function(values, cb) {
		this.adapter.create(this.identity,values,cb);
	};
	this.find = function(criteria, cb) {
		this.adapter.find(this.identity,criteria,cb);
	};
	this.update = function(criteria, values, cb) {
		this.adapter.update(this.identity,criteria,values,cb);
	};
	this.destroy = function(criteria, cb) {
		this.adapter.destroy(this.identity,criteria,cb);
	};

	this.lock = function(criteria, cb) {
		this.adapter.lock(this.identity,criteria,cb);
	};
	this.unlock = function(criteria, cb) {
		this.adapter.unlock(this.identity,criteria,cb);
	};

	// Bind instance methods to collection
	_.bindAll(definition);
	_.bindAll(this);
};