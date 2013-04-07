var _ = require('underscore');

// Extend adapter definition
// (also pass in access to complete adapter set in case it's necessary)
module.exports = function(adapterDef, cb) {
	var self = this;

	// Pass through defaults from adapterDef
	// (absorbs any properties/methods from definition that are undefined here)
	_.defaults(this,adapterDef);

	// Logic to handle the (re)instantiation and teardown of collections
	_.extend(this,require('./adapter/setupAndTeardown')(adapterDef));

	// Mix in schema / DDL methods
	_.extend(this,require('./adapter/ddl')(adapterDef));	

	// Mix in data manipulation / DQL methods
	_.extend(this,require('./adapter/dql')(adapterDef));

	// Mix in compound queries
	_.extend(this,require('./adapter/compoundQueries')(adapterDef));

	// Mix in aggregate queries
	_.extend(this,require('./adapter/aggregateQueries')(adapterDef));	

	// Mix in transactions
	_.extend(this,require('./adapter/transaction')(adapterDef));

	// Mix in sync strategies
	_.extend(this,require('./adapter/sync.js')(adapterDef));


	// stream.write() is used to send data
	// Must call stream.end() to complete stream
	this.stream = function (collectionName, criteria, stream) {
		if(!adapterDef.stream) return stream.end('No stream() method defined in adapter!');
		adapterDef.stream(collectionName, criteria, stream);
	};

	// If @collectionName and @otherCollectionName are both using this adapter, do a more efficient remote join.
	// (By default, an inner join, but right and left outer joins are also supported.)
	this.join = function(collectionName, otherCollectionName, key, foreignKey, left, right, cb) {
		// TODO
		adapterDef.join ? adapterDef.join(collectionName, otherCollectionName, key, foreignKey, left, right, cb) : cb('Join not supported!');
	};


	// Bind adapter methods to self
	_.bindAll(adapterDef);
	_.bindAll(this);
	_.bind(this.sync.drop, this);
	_.bind(this.sync.alter, this);
	_.bind(this.sync.safe, this);

	// Mark as valid adapter
	this._isWaterlineAdapter = true;


	// Generate commit log collection if commitLog is not disabled
	if (adapterDef.commitLog) {

		// Build commit log definition using defaults and adapter def
		this.commitLog = _.extend({

			// Use sails-dirty by default as adapter
			adapter: 'sails-dirty',

			// Don't mess with it once it's been created
			migrate: 'alter',

			// Never grant global access to the collection
			globalize: false,

			// Always use the auto-incremented primary key, id
			autoPK: true,
			
			// Explicitly disable commit log to prevent recursion
			commitLog: false

		},adapterDef.commitLog);
	}

	return cb && cb(null, self);
};
