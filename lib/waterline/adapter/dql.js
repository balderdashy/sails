var _ = require('underscore');
var normalize = require('../normalize.js');

//////////////////////////////////////////////////////////////////////
// DQL
//////////////////////////////////////////////////////////////////////

module.exports = function(adapterDef) {

	var pub = {};


	//////////////////////////////////////////////////////////////////////////////
	// WARNING: instance.save() will be deprecated in 0.9.0
	//////////////////////////////////////////////////////////////////////////////
	pub.__save = function (collectionName, values, cb) {
		// TODO: create or update model in adapter, using id to determine the model in question
		// BUT don't include the save() method!

		// TODO: use whatever the primary key is configured to, not just `id`
		var pk = 'id';
		var pkValue = values[pk];

		// TODO: use updateOrCreate()
		this.update(collectionName, pkValue, values, cb);
	};

	//////////////////////////////////////////////////////////////////////////////
	// WARNING: instance.destroy() will be deprecated in 0.9.0
	//////////////////////////////////////////////////////////////////////////////
	pub.__destroy = function (collectionName, cb) {
		// TODO: destroy in adapter, using id to determine the model in question
		cb("destroy() NOT SUPPORTED YET!");
	};

	pub.create = function(collectionName, values, cb) {

		if(!adapterDef.create) return cb("No create() method defined in adapter!");
		adapterDef.create(collectionName, values, cb);
	};

	// Find a set of models
	pub.findAll = function(collectionName, criteria, cb) {

		if(!adapterDef.find) return cb("No find() method defined in adapter!");
		criteria = normalize.criteria(criteria);
		adapterDef.find(collectionName, criteria, cb);
	};

	// Find exactly one model
	pub.find = function(collectionName, criteria, cb) {

		// If no criteria specified AT ALL, use first model
		if (!criteria) criteria = {limit: 1};

		this.findAll(collectionName, criteria, function (err, models) {
			if (!models) return cb(err);
			if (models.length < 1) return cb(err);
			else if (models.length > 1) return cb("More than one "+collectionName+" returned!");
			else return cb(null,models[0]);
		});
	};

	pub.count = function(collectionName, criteria, cb) {

		var self = this;
		criteria = normalize.criteria(criteria);
		if (!adapterDef.count) {
			self.findAll(collectionName, criteria, function (err,models){
				cb(err,models.length);
			});
		}
		else adapterDef.count(collectionName, criteria, cb);
	};


	pub.update = function(collectionName, criteria, values, cb) {

		if (!criteria) return cb('No criteria or id specified!');

		this.updateAll(collectionName, criteria, values, function (err, models) {
			if (!models) return cb(err);
			if (models.length < 1) return cb(err);
			else if (models.length > 1) return cb("More than one "+collectionName+" returned!");
			else return cb(null,models[0]);
		});
	};

	pub.updateAll = function (collectionName, criteria, values, cb) {

		if(!adapterDef.update) return cb("No update() method defined in adapter!");
		criteria = normalize.criteria(criteria);
		return adapterDef.update(collectionName, criteria, values, cb);
	};

	pub.destroy = function(collectionName, criteria, cb) {

		if(!adapterDef.destroy) return cb("No destroy() method defined in adapter!");
		criteria = normalize.criteria(criteria);
		adapterDef.destroy(collectionName, criteria, cb);
	};

	return pub;
};