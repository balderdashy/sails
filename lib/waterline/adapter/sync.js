var _ = require('underscore');
var augmentAttributes = require('../augmentAttributes');

//////////////////////////////////////////////////////////////////////
// Sync strategies
//////////////////////////////////////////////////////////////////////

module.exports = function(adapterDef) {

	var pub = {};
	
	// Sync given collection's schema with the underlying data model
	// Controls whether database is dropped and recreated when app starts,
	// or whether waterline will try and synchronize the schema with the app models.
	pub.sync = {

		// Drop and recreate collection
		drop: function(collection, cb) {
			var self = this;
			this.drop(collection.identity, function afterDrop(err, data) {
				if (err) return cb(err);
				else self.define(collection.identity, collection, cb);
			});
		},

		// Alter schema
		alter: function(collection, cb) {
			var self = this;

			// Check that collection exists-- 
			this.describe(collection.identity, function afterDescribe(err, attrs) {
				attrs = _.clone(attrs);
				if (err) return cb(err);

				// if it doesn't go ahead and add it and get out
				else if (!attrs) return self.define(collection.identity, collection, cb);

				// Otherwise, if it *DOES* exist, we'll try and guess what changes need to be made
				else self.alter(collection.identity, augmentAttributes(collection.attributes, collection), cb);
			});
		},

		// Do nothing to the underlying data model
		safe: function(collection, cb) {
			cb();
		}
	};

	return pub;
};