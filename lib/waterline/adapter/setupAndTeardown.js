var _ = require('underscore');

//////////////////////////////////////////////////////////////////////
// Setup and teardown
//////////////////////////////////////////////////////////////////////
module.exports = function(adapterDef) {
	var pub = {

		// Logic to handle the (re)instantiation of collections
		registerCollection: function(collection, cb) {
			if (adapterDef.registerCollection) {
				// Assign appropriate "this" context in user-level adapter
				_.bindAll(adapterDef);
				
				adapterDef.registerCollection(collection,cb);
			}
			else cb && cb();
		},

		// Teardown is fired once-per-adapter
		// Should tear down any open connections, etc. for each collection
		// (i.e. tear down any remaining connections to the underlying data model)
		// (i.e. flush data to disk before the adapter shuts down)
		teardown: function(cb) {
			if (adapterDef.teardown) adapterDef.teardown.apply(this,arguments);
			else cb && cb();
		}
	};

	return pub;
};