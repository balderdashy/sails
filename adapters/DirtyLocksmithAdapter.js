// Dependencies
var _ = require('underscore');

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