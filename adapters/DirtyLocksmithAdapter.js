// Dependencies
var _ = require('underscore');

// ******************************************
// Poor man's auto-increment
// ******************************************
// In production, the transaction database should be set to something else 
// with true, database-side auto-increment capabilities
// This in-memory auto-increment will not scale to a multi-instance / cluster setup.
// NOTE: you can't use an adapter which depends on transactions (i.e. Dirty)
// ******************************************
var aiCounter = 1;

/*---------------------
	:: DirtyLocksmith
	-> adapter

	*this refers to the adapter
---------------------*/

// This disk+memory adapter is for managing transactions
// Basically, it does the same thing as the baseline dirty adapter (minus the atomicity constraint on create())
// This means it doesn't work for things like auto-increment and validation.
// But you're not using it for that, right?  Use the Dirty Adapter if you need that kind of stuff.
module.exports = _.extend({},require('./DirtyAdapter'),{

	identity: 'dirtylocksmith',

	// Create one or more new models in the collection
	create: function(collectionName, values, cb) {
		this.log(" CREATING :: " + collectionName, values);
		values = values || {};
		var dataKey = this.config.dataPrefix + collectionName;
		var data = this.db.get(dataKey);
		var self = this;

		// ******************************************
		// Poor man's auto-increment
		// (see note above)
		// ******************************************
		values.id = aiCounter;
		aiCounter++;
		// ******************************************

		// Create new model
		// (if data collection doesn't exist yet, create it)
		data = data || [];
		data.push(values);

		// Replace data collection and go back
		self.db.set(dataKey, data, function(err) {
			return cb(err, values);
		});
	}
});