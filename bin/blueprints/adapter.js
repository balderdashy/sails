/*---------------------
	:: <%- entity %> 
	-> adapter
---------------------*/
var adapter = {

	identity: '<%- entity %>',

	// The complete set of reusable connections from the main app to this adapter
	clamps: {},

	// Required method to set up the adapter
	// This checks the collection being registered for a few uniqueness characteristics you might be interested in
	// (e.g. if this is MySQL, is the hostname, username, password, and database the same?)
	// This keeps the number of clamps to a minimum, even though this code is being shared in a polymorphic fashion
	registerCollection: function (collection, cb) {

		// If a suitably similar clamp to this adapter already exists, use it
		var found = _.find(this.clamps, function (link) {

			// Put similarity criteria here
			return _.isEqual(link, collection);
		});
		if (found) this.clamps[collection.identity] = found;

		// Otherwise, create an artifact of this clamp in case it can be reused
		else this.clamps[collection.identity] = {

			// Store identifying info about this clamp so that it can be reused safely
			somethingAboutMe: collection.somethingAboutMe
		};

		cb();
	}
};

_.bindAll(adapter);
module.exports = adapter;